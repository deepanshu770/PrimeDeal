import { Request, Response } from "express";
import { prisma } from "../db/db";
import { asyncHandler, AppError } from "../utils/asyncHandler";
import { OrderStatus, PaymentStatus } from "@prisma/client";

export const getOwnerDashboard = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = Number(req.id);

  // 1️⃣ Validate Owner
  const owner = await prisma.user.findUnique({
    where: { id: ownerId },
    select: { id: true, fullname: true }
  });

  if (!owner) throw new AppError("Unauthorized", 401);

  // 2️⃣ Get All Shops Owned
  const shops = await prisma.shop.findMany({
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
  const totalOrders = await prisma.order.count({
    where: { shopId: { in: shopIds } }
  });

  const deliveredOrders = await prisma.order.count({
    where: { shopId: { in: shopIds }, orderStatus: OrderStatus.delivered }
  });

  const pendingOrders = await prisma.order.count({
    where: { shopId: { in: shopIds }, orderStatus: OrderStatus.pending }
  });

  const cancelledOrders = await prisma.order.count({
    where: { shopId: { in: shopIds }, orderStatus: OrderStatus.cancelled }
  });

  const totalRevenueAgg = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: {
      shopId: { in: shopIds },
      paymentStatus: PaymentStatus.completed,
    },
  });

  const totalRevenue = totalRevenueAgg._sum.totalAmount || 0;

  // Today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = await prisma.order.count({
    where: { shopId: { in: shopIds }, createdAt: { gte: today } },
  });

  const todayRevenueAgg = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: {
      shopId: { in: shopIds },
      createdAt: { gte: today },
      paymentStatus: PaymentStatus.completed,
    },
  });

  const todayRevenue = todayRevenueAgg._sum.totalAmount || 0;

  // -----------------------------------------------------------
  // ⭐ GLOBAL TOP 5 BEST SELLING PRODUCTS
  // -----------------------------------------------------------
  const globalGrouped = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    where: { order: { shopId: { in: shopIds } } },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });

  const globalTopProducts = await prisma.product.findMany({
    where: { id: { in: globalGrouped.map((g) => g.productId) } },
    select: { id: true, name: true, image: true }
  });

  // -----------------------------------------------------------
  // ⚠ LOW STOCK ALERTS (ALL SHOPS)
  // -----------------------------------------------------------
  const lowStockGlobal = await prisma.shopInventory.findMany({
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
  const recentOrders = await prisma.order.findMany({
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
    const shopRevenueAgg = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        shopId: shop.id,
        paymentStatus: PaymentStatus.completed,
      },
    });

    const shopTopItems = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      where: { order: { shopId: shop.id } },
      orderBy: { _sum: { quantity: "desc" } },
      take: 3,
    });

    const shopTopProducts = await prisma.product.findMany({
      where: { id: { in: shopTopItems.map((i) => i.productId) } },
      select: { id: true, name: true, image: true }
    });

    const shopLowStock = await prisma.shopInventory.findMany({
      where: { shopId: shop.id, quantity: { lt: 5 } },
      include: { product: true }
    });

    shopReports.push({
      shopId: shop.id,
      shopName: shop.storeName,
      shopRevenue: shopRevenueAgg._sum.totalAmount || 0,
      totalOrders: await prisma.order.count({ where: { shopId: shop.id } }),
      todayOrders: await prisma.order.count({
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
});
