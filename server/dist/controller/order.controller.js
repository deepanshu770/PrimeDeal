"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getOrderById = exports.getShopOrders = exports.getUserOrders = exports.createOrder = void 0;
const db_1 = require("../db/db");
const asyncHandler_1 = require("../utils/asyncHandler");
const client_1 = require("@prisma/client");
exports.createOrder = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = Number(req.id);
    const { cartItems, addressId } = req.body;
    if (!(cartItems === null || cartItems === void 0 ? void 0 : cartItems.length))
        throw new asyncHandler_1.AppError("Cart is empty", 400);
    if (!addressId)
        throw new asyncHandler_1.AppError("Address ID is required", 400);
    // 🧍 Validate address ownership
    const address = yield db_1.prisma.address.findFirst({
        where: { id: addressId, userId },
    });
    if (!address)
        throw new asyncHandler_1.AppError("Invalid address selected", 403);
    // Group items by shop
    const itemsByShop = new Map();
    for (const item of cartItems) {
        if (!item.shopId)
            throw new asyncHandler_1.AppError("Missing shopId in cart item", 400);
        const arr = (_a = itemsByShop.get(item.shopId)) !== null && _a !== void 0 ? _a : [];
        arr.push(item);
        itemsByShop.set(item.shopId, arr);
    }
    const createdOrders = [];
    yield db_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        for (const [shopId, items] of itemsByShop) {
            const productIds = items.map((i) => i.productId);
            // 🔍 Validate inventory
            const inventory = yield tx.shopInventory.findMany({
                where: { shopId, productId: { in: productIds } },
                select: { productId: true, price: true, quantity: true, isAvailable: true },
            });
            if (inventory.length === 0)
                throw new asyncHandler_1.AppError(`No inventory found for shop ${shopId}`, 400);
            let totalAmount = 0;
            const orderItemsData = items.map((it) => {
                const inv = inventory.find((i) => i.productId === it.productId);
                if (!inv || !inv.isAvailable)
                    throw new asyncHandler_1.AppError(`Product ${it.productId} unavailable in shop ${shopId}`, 400);
                if (inv.quantity < it.quantity)
                    throw new asyncHandler_1.AppError(`Insufficient stock for product ${it.productId}`, 400);
                totalAmount += inv.price * it.quantity;
                return {
                    productId: it.productId,
                    quantity: it.quantity,
                    pricePerUnit: inv.price,
                };
            });
            if (totalAmount <= 0)
                throw new asyncHandler_1.AppError(`Invalid total amount for shop ${shopId}`, 400);
            // 🧾 Create Order
            const order = yield tx.order.create({
                data: {
                    userId,
                    shopId,
                    deliveryAddressId: addressId,
                    totalAmount,
                    orderStatus: client_1.OrderStatus.pending,
                    paymentStatus: client_1.PaymentStatus.pending,
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
                yield tx.shopInventory.updateMany({
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
    }));
    res.status(201).json({
        success: true,
        message: "Orders placed successfully",
        count: createdOrders.length,
        orders: createdOrders,
    });
}));
exports.getUserOrders = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = Number(req.id);
    const orders = yield db_1.prisma.order.findMany({
        where: { userId },
        include: {
            shop: { select: { id: true, storeName: true, storeBanner: true } },
            items: { include: { product: true } },
            address: true,
        },
        orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ success: true, count: orders.length, orders });
}));
exports.getShopOrders = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const shopId = Number(req.params.shopId);
    const userId = Number(req.id);
    // 🧠 Ensure shop belongs to the logged-in user
    const shop = yield db_1.prisma.shop.findFirst({ where: { id: shopId, userId } });
    if (!shop)
        throw new asyncHandler_1.AppError("Unauthorized access to this shop’s orders", 403);
    const orders = yield db_1.prisma.order.findMany({
        where: { shopId },
        include: {
            user: { select: { fullname: true, email: true } },
            address: true,
            items: { include: { product: true } },
        },
        orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ success: true, count: orders.length, orders });
}));
exports.getOrderById = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const orderId = Number(req.params.orderId);
    const order = yield db_1.prisma.order.findUnique({
        where: { id: orderId },
        include: {
            shop: { select: { id: true, storeName: true, city: true } },
            user: { select: { fullname: true, email: true } },
            address: true,
            items: { include: { product: true } },
        },
    });
    if (!order)
        throw new asyncHandler_1.AppError("Order not found", 404);
    res.status(200).json({ success: true, order });
}));
exports.updateOrderStatus = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const orderId = Number(req.params.orderId);
    const { status } = req.body;
    const userId = Number(req.id);
    const order = yield db_1.prisma.order.findUnique({
        where: { id: orderId },
        include: {
            shop: true,
            items: true,
        },
    });
    if (!order)
        throw new asyncHandler_1.AppError("Order not found", 404);
    if (order.shop.userId !== userId)
        throw new asyncHandler_1.AppError("You are not authorized to update this order", 403);
    const validStatuses = [
        "pending",
        "confirmed",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
    ];
    if (!validStatuses.includes(status))
        throw new asyncHandler_1.AppError("Invalid status value", 400);
    // If order is being cancelled -> Restore stock
    if (status === "cancelled") {
        for (const item of order.items) {
            yield db_1.prisma.shopInventory.updateMany({
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
    const updated = yield db_1.prisma.order.update({
        where: { id: orderId },
        data: { orderStatus: status },
    });
    res.status(200).json({
        success: true,
        message: `Order status updated to '${status}'`,
        order: updated,
    });
}));
