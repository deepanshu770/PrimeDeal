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
exports.getOwnerDashboard = void 0;
const db_1 = require("../db/db");
const asyncHandler_1 = require("../utils/asyncHandler");
const client_1 = require("@prisma/client");
exports.getOwnerDashboard = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const ownerId = Number(req.id);
    // 1️⃣ Validate Owner
    const owner = yield db_1.prisma.user.findUnique({
        where: { id: ownerId },
        select: { id: true, fullname: true }
    });
    if (!owner)
        throw new asyncHandler_1.AppError("Unauthorized", 401);
    // 2️⃣ Get All Shops Owned
    const shops = yield db_1.prisma.shop.findMany({
        where: { userId: ownerId },
        select: { id: true, storeName: true, city: true }
    });
    if (shops.length === 0) {
        return res.status(200).json({
            success: true,
            message: "You do not own any shops",
            dashboard: {},
        });
    }
    const shopIds = shops.map((s) => s.id);
    // -----------------------------------------------------------
    // 📊 GLOBAL TOTAL STATS
    // -----------------------------------------------------------
    const totalOrders = yield db_1.prisma.order.count({
        where: { shopId: { in: shopIds } }
    });
    const deliveredOrders = yield db_1.prisma.order.count({
        where: { shopId: { in: shopIds }, orderStatus: client_1.OrderStatus.delivered }
    });
    const pendingOrders = yield db_1.prisma.order.count({
        where: { shopId: { in: shopIds }, orderStatus: client_1.OrderStatus.pending }
    });
    const cancelledOrders = yield db_1.prisma.order.count({
        where: { shopId: { in: shopIds }, orderStatus: client_1.OrderStatus.cancelled }
    });
    const totalRevenueAgg = yield db_1.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
            shopId: { in: shopIds },
            paymentStatus: client_1.PaymentStatus.completed,
        },
    });
    const totalRevenue = totalRevenueAgg._sum.totalAmount || 0;
    // Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = yield db_1.prisma.order.count({
        where: { shopId: { in: shopIds }, createdAt: { gte: today } },
    });
    const todayRevenueAgg = yield db_1.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
            shopId: { in: shopIds },
            createdAt: { gte: today },
            paymentStatus: client_1.PaymentStatus.completed,
        },
    });
    const todayRevenue = todayRevenueAgg._sum.totalAmount || 0;
    // -----------------------------------------------------------
    // ⭐ GLOBAL TOP 5 BEST SELLING PRODUCTS
    // -----------------------------------------------------------
    const globalGrouped = yield db_1.prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        where: { order: { shopId: { in: shopIds } } },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
    });
    const globalTopProducts = yield db_1.prisma.product.findMany({
        where: { id: { in: globalGrouped.map((g) => g.productId) } },
        select: { id: true, name: true, image: true }
    });
    // -----------------------------------------------------------
    // ⚠ LOW STOCK ALERTS (ALL SHOPS)
    // -----------------------------------------------------------
    const lowStockGlobal = yield db_1.prisma.shopInventory.findMany({
        where: {
            shopId: { in: shopIds },
            quantity: { lt: 5 },
        },
        include: {
            product: { select: { name: true, image: true } },
            shop: { select: { storeName: true } },
        },
    });
    // -----------------------------------------------------------
    // 📦 RECENT ORDERS (GLOBAL)
    // -----------------------------------------------------------
    const recentOrders = yield db_1.prisma.order.findMany({
        where: { shopId: { in: shopIds } },
        include: {
            user: { select: { fullname: true } },
            items: { include: { product: true } },
            shop: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
    });
    // -----------------------------------------------------------
    // 🔥 INDIVIDUAL SHOP REPORTS
    // -----------------------------------------------------------
    const shopReports = [];
    for (const shop of shops) {
        const shopRevenueAgg = yield db_1.prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: {
                shopId: shop.id,
                paymentStatus: client_1.PaymentStatus.completed,
            },
        });
        const shopTopItems = yield db_1.prisma.orderItem.groupBy({
            by: ["productId"],
            _sum: { quantity: true },
            where: { order: { shopId: shop.id } },
            orderBy: { _sum: { quantity: "desc" } },
            take: 3,
        });
        const shopTopProducts = yield db_1.prisma.product.findMany({
            where: { id: { in: shopTopItems.map((i) => i.productId) } },
            select: { id: true, name: true, image: true }
        });
        const shopLowStock = yield db_1.prisma.shopInventory.findMany({
            where: { shopId: shop.id, quantity: { lt: 5 } },
            include: { product: true }
        });
        shopReports.push({
            shopId: shop.id,
            shopName: shop.storeName,
            shopRevenue: shopRevenueAgg._sum.totalAmount || 0,
            totalOrders: yield db_1.prisma.order.count({ where: { shopId: shop.id } }),
            todayOrders: yield db_1.prisma.order.count({
                where: { shopId: shop.id, createdAt: { gte: today } },
            }),
            lowStock: shopLowStock,
            topProducts: shopTopItems.map((tp) => ({
                productId: tp.productId,
                quantitySold: tp._sum.quantity,
                product: shopTopProducts.find((p) => p.id === tp.productId),
            })),
        });
    }
    // -----------------------------------------------------------
    // 📤 FINAL RESPONSE
    // -----------------------------------------------------------
    return res.status(200).json({
        success: true,
        shops,
        dashboard: {
            summary: {
                totalOrders,
                deliveredOrders,
                pendingOrders,
                cancelledOrders,
                totalRevenue,
                todayRevenue,
                todayOrders,
            },
            topProducts: globalGrouped.map((item) => ({
                productId: item.productId,
                quantitySold: item._sum.quantity,
                product: globalTopProducts.find((p) => p.id === item.productId),
            })),
            lowStock: lowStockGlobal,
            recentOrders,
            shopWise: shopReports,
        },
    });
}));
