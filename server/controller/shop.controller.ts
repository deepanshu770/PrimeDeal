import { Request, Response } from "express";
import { prisma } from "../db/db";
import uploadImageOnCloudinary from "../utils/imageUpload";
import { asyncHandler, AppError } from "../utils/asyncHandler";

/* ---------------------------------------------------
   CREATE SHOP
--------------------------------------------------- */
export const createShop = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { storeName, city, address, deliveryTime, latitude, longitude } =
      req.body;
    const file = req.file;

    if (!file) throw new AppError("Please upload a store banner image", 400);
    if (!storeName || !city || !address || !deliveryTime)
      throw new AppError("All fields are required", 400);

    const userId = Number(req.id);
    const processedStoreName = storeName.trim();
    const processedCity = city.trim().toLowerCase();
    const numericDeliveryTime = Number(deliveryTime);

    const storeBanner = await uploadImageOnCloudinary(
      file as Express.Multer.File
    );

    await prisma.shop.create({
      data: {
        userId,
        storeName: processedStoreName,
        city: processedCity,
        address: address.trim(),
        deliveryTime: numericDeliveryTime,
        storeBanner,
        latitude: Number(latitude),
        longitude: Number(longitude),
      },
    });

    res
      .status(201)
      .json({ success: true, message: "Shop created successfully" });
  }
);

/* ---------------------------------------------------
   GET ALL SHOPS OF USER
--------------------------------------------------- */
export const getShop = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = Number(req.id);

    const shops = await prisma.shop.findMany({
      where: { userId },
      include: {
        inventory: {
          include: { product: true },
        },
      },
    });

    if (shops.length === 0) throw new AppError("No shops found", 404);

    res.status(200).json({ success: true, shops });
  }
);

/* ---------------------------------------------------
   GET SHOPS IN USER'S CITY
--------------------------------------------------- */
export const getShopByCity = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = Number(req.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: {
          where: { isDefault: true },
          take: 1,
        },
      },
    });

    if (!user) throw new AppError("User not found", 404);

    const defaultAddress = user.addresses[0];
    if (!defaultAddress)
      throw new AppError(
        "Default address not found. Please set one before browsing local shops.",
        400
      );

    const shops = await prisma.shop.findMany({
      where: {
        city: defaultAddress.city.toLowerCase(),
      },
      include: {
        inventory: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      city: defaultAddress.city,
      shops,
    });
  }
);

/* ---------------------------------------------------
   UPDATE SHOP DETAILS
--------------------------------------------------- */
export const updateShop = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { storeName, city, address, deliveryTime, shopId } = req.body;
    const file = req.file;

    const shop = await prisma.shop.findUnique({
      where: { id: Number(shopId) },
    });
    if (!shop) throw new AppError("Shop not found", 404);

    let storeBanner = shop.storeBanner;
    if (file)
      storeBanner = await uploadImageOnCloudinary(file as Express.Multer.File);

    const updatedShop = await prisma.shop.update({
      where: { id: shop.id },
      data: {
        storeName: storeName.trim(),
        city: city.trim().toLowerCase(),
        address: address.trim(),
        deliveryTime: Number(deliveryTime),
        storeBanner,
      },
    });

    res
      .status(200)
      .json({
        success: true,
        message: "Shop updated successfully",
        shop: updatedShop,
      });
  }
);

/* ---------------------------------------------------
   GET SHOP ORDERS
--------------------------------------------------- */
export const getShopOrder = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const shopId = Number(req.params.shopId);

    const shop = await prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop) throw new AppError("Shop not found", 404);

    const orders = await prisma.order.findMany({
      where: { shopId },
      include: {
        user: true,
        address: true,
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, orders });
  }
);

/* ---------------------------------------------------
   UPDATE ORDER STATUS
--------------------------------------------------- */
export const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
    });
    if (!order) throw new AppError("Order not found", 404);

    const updatedOrder = await prisma.order.update({
      where: { id: Number(orderId) },
      data: { orderStatus },
    });

    res
      .status(200)
      .json({ success: true, message: "Order status updated", updatedOrder });
  }
);

/* ---------------------------------------------------
   SEARCH PRODUCT (by name/description/category)
--------------------------------------------------- */
export const searchProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const query = (req.query.q as string)?.trim() || "";
    const userId = Number(req.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: {
          where: { isDefault: true },
          take: 1,
        },
      },
    });

    if (!user) throw new AppError("User not found", 404);

    const defaultAddress = user.addresses[0];
    if (!defaultAddress)
      throw new AppError(
        "Default address not found. Please set one before searching products.",
        400
      );

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { brand: { contains: query } },
          { netQty: { contains: query } },
        ],
        inShops: {
          some: {
            shop: {
              city: { equals: defaultAddress.city },
            },
          },
        },
      },
      include: {
        inShops: {
          include: {
            shop: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      city: defaultAddress.city,
      products,
    });
  }
);

/* ---------------------------------------------------
   GET SINGLE SHOP DETAILS
--------------------------------------------------- */
export const getSingleShop = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const shopId = Number(req.params.id);

    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        inventory: {
          include: { product: true },
        },
      },
    });

    if (!shop) throw new AppError("Shop not found", 404);

    res.status(200).json({ success: true, shop });
  }
);
