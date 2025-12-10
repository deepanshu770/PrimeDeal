import { Request, Response } from "express";
import { prisma } from "../db/db";
import { asyncHandler, AppError } from "../utils/asyncHandler";
import { OrderStatus, PaymentStatus } from "@prisma/client";

interface CartItemPayload {
  productId: number;
  quantity: number;
  shopId: number;
}


export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.id);
  const { cartItems, addressId } = req.body as {
    cartItems: CartItemPayload[];
    addressId: number;
  };

  if (!cartItems?.length) throw new AppError("Cart is empty", 400);
  if (!addressId) throw new AppError("Address ID is required", 400);

  // 🧍 Validate address ownership
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!address) throw new AppError("Invalid address selected", 403);

  // Group items by shop
  const itemsByShop = new Map<number, CartItemPayload[]>();
  for (const item of cartItems) {
    if (!item.shopId) throw new AppError("Missing shopId in cart item", 400);
    const arr = itemsByShop.get(item.shopId) ?? [];
    arr.push(item);
    itemsByShop.set(item.shopId, arr);
  }

  const createdOrders: any[] = [];

  await prisma.$transaction(async (tx) => {
    for (const [shopId, items] of itemsByShop) {
      const productIds = items.map((i) => i.productId);

      // 🔍 Validate inventory
      const inventory = await tx.shopInventory.findMany({
        where: { shopId, productId: { in: productIds } },
        select: { productId: true, price: true, quantity: true, isAvailable: true },
      });

      if (inventory.length === 0)
        throw new AppError(`No inventory found for shop ${shopId}`, 400);

      let totalAmount = 0;
      const orderItemsData = items.map((it) => {
        const inv = inventory.find((i) => i.productId === it.productId);
        if (!inv || !inv.isAvailable)
          throw new AppError(`Product ${it.productId} unavailable in shop ${shopId}`, 400);
        if (inv.quantity < it.quantity)
          throw new AppError(`Insufficient stock for product ${it.productId}`, 400);

        totalAmount += inv.price * it.quantity;
        return {
          productId: it.productId,
          quantity: it.quantity,
          pricePerUnit: inv.price,
        };
      });

      if (totalAmount <= 0)
        throw new AppError(`Invalid total amount for shop ${shopId}`, 400);

      // 🧾 Create Order
      const order = await tx.order.create({
        data: {
          userId,
          shopId,
          deliveryAddressId: addressId,
          totalAmount,
          orderStatus: OrderStatus.pending,
          paymentStatus: PaymentStatus.pending,
          items: { create: orderItemsData },
        },
        include: {
          items: { include: { product: true } },
          address: true,
          shop: true,
        },
      });

      // 📦 Update stock
      for (const item of items) {
        await tx.shopInventory.updateMany({
          where: {
            shopId,
            productId: item.productId,
            quantity: { gte: item.quantity },
          },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      createdOrders.push(order);
    }
  });

  res.status(201).json({
    success: true,
    message: "Orders placed successfully",
    count: createdOrders.length,
    orders: createdOrders,
  });
});


export const getUserOrders = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.id);

  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      shop: { select: { id: true, storeName: true, storeBanner: true } },
      items: { include: { product: true } },
      address: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({ success: true, count: orders.length, orders });
});


export const getShopOrders = asyncHandler(async (req: Request, res: Response) => {
  const shopId = Number(req.params.shopId);
  const userId = Number(req.id);

  // 🧠 Ensure shop belongs to the logged-in user
  const shop = await prisma.shop.findFirst({ where: { id: shopId, userId } });
  if (!shop) throw new AppError("Unauthorized access to this shop’s orders", 403);

  const orders = await prisma.order.findMany({
    where: { shopId },
    include: {
      user: { select: { fullname: true, email: true } },
      address: true,
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({ success: true, count: orders.length, orders });
});


export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const orderId = Number(req.params.orderId);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      shop: { select: { id: true, storeName: true, city: true } },
      user: { select: { fullname: true, email: true } },
      address: true,
      items: { include: { product: true } },
    },
  });

  if (!order) throw new AppError("Order not found", 404);

  res.status(200).json({ success: true, order });
});


export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const orderId = Number(req.params.orderId);
  const { status } = req.body as { status: OrderStatus };
  const userId = Number(req.id);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      shop: true,
      items: true,
    },
  });

  if (!order) throw new AppError("Order not found", 404);
  if (order.shop.userId !== userId)
    throw new AppError("You are not authorized to update this order", 403);

  const validStatuses: OrderStatus[] = [
    "pending",
    "confirmed",
    "preparing",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ];
  if (!validStatuses.includes(status))
    throw new AppError("Invalid status value", 400);

  // If order is being cancelled -> Restore stock
  if (status === "cancelled") {
    for (const item of order.items) {
      await prisma.shopInventory.updateMany({
        where: {
          shopId: order.shopId,
          productId: item.productId,
        },
        data: {
          quantity: {
            increment: item.quantity, // 🔁 restore
          },
        },
      });
    }
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { orderStatus: status },
  });

  res.status(200).json({
    success: true,
    message: `Order status updated to '${status}'`,
    order: updated,
  });
});
