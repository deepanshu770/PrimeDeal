import { Request, Response } from "express";
import { prisma } from "../db/db";
import { asyncHandler, AppError } from "../utils/asyncHandler";
import { OrderStatus, PaymentStatus } from "@prisma/client";

/* ------------ Types ------------ */
interface CartItemPayload {
  productId: number;
  quantity: number;
  shopId: number;
}

/* ===========================================================
   🧾 CREATE ORDER (using existing Address ID)
=========================================================== */
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.id);
  const { cartItems, addressId } = req.body as {
    cartItems: CartItemPayload[];
    addressId: number;
  };

  if (!cartItems?.length) throw new AppError("Cart is empty", 400);
  if (!addressId) throw new AppError("Address ID is required", 400);

  // 🧍 Verify that address belongs to this user
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!address) throw new AppError("Invalid address selected", 403);

  // 🔸 Group items by shop
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

      // 🔍 Fetch inventory for validation and pricing
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

      // 🧾 Create order (use existing addressId)
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

      // 📦 Decrement inventory stock
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


/* ===========================================================
   👤 GET ALL ORDERS OF LOGGED-IN USER
=========================================================== */
export const getUserOrders = asyncHandler(
  async (req: Request, res: Response) => {
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

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  }
);

/* ===========================================================
   🏪 GET ORDERS FOR A SPECIFIC SHOP (Shop Owner)
=========================================================== */
export const getShopOrders = asyncHandler(
  async (req: Request, res: Response) => {
    const shopId = Number(req.params.shopId);

    const orders = await prisma.order.findMany({
      where: { shopId },
      include: {
        user: { select: { fullname: true, email: true } },
        address: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  }
);

/* ===========================================================
   🔍 GET SINGLE ORDER DETAILS
=========================================================== */
export const getOrderById = asyncHandler(
  async (req: Request, res: Response) => {
    const orderId = Number(req.params.orderId);
console.log("Getting Order ID : ",orderId)
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
  }
);

/* ===========================================================
   🔄 UPDATE ORDER STATUS
=========================================================== */
export const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const orderId = Number(req.params.orderId);
    const { status } = req.body as { status: OrderStatus };

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError("Order not found", 404);

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: status },
    });

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updated,
    });
  }
);
