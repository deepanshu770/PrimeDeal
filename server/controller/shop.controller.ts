import { Request, Response } from "express";
import { prisma } from "../db/db";
import uploadImageOnCloudinary from "../utils/imageUpload";
import { asyncHandler, AppError } from "../utils/asyncHandler";

export const createShop = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const {
      storeName,
      city,
      address,
      deliveryTime,
      latitude,
      longitude,
      description,
    } = req.body;
    const file = req.file;
    const userId = Number(req.id);

    // 🧠 Validation
    if (!file) throw new AppError("Please upload a store banner image", 400);
    if (!storeName || !city || !address || !deliveryTime)
      throw new AppError("All required fields must be provided", 400);

    // 🧹 Data normalization
    const processedCity = city.trim().toLowerCase();
    const processedStoreName = storeName.trim();
    const numericDeliveryTime = Number(deliveryTime);

    if (isNaN(numericDeliveryTime)) {
      throw new AppError("Delivery time must be a number", 400);
    }

    // 🖼️ Upload image
    const storeBanner = await uploadImageOnCloudinary(file as Express.Multer.File);

    // 💾 Create shop in DB
    const createdShop = await prisma.shop.create({
      data: {
        userId,
        storeName: processedStoreName,
        description: description?.trim() || "",
        city: processedCity,
        address: address.trim(),
        deliveryTime: numericDeliveryTime,
        storeBanner,
        latitude: Number(latitude),
        longitude: Number(longitude),
      },
    });

    res.status(201).json({
      success: true,
      message: "Shop created successfully",
      shop: createdShop,
    });
  }
);


export const getShop = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.id);

  const shops = await prisma.shop.findMany({
    where: { userId },
    include: {
      inventory: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (shops.length === 0) {
    throw new AppError("No shops found for this user", 404);
  }

  res.status(200).json({ success: true, count: shops.length, shops });
});

export const getShopByCity = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.id);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      addresses: { where: { isDefault: true }, take: 1 },
    },
  });

  if (!user) throw new AppError("User not found", 404);
  const defaultAddress = user.addresses[0];

  if (!defaultAddress)
    throw new AppError("Please set a default address to find nearby shops", 400);

  const city = defaultAddress.city.trim().toLowerCase();

  const shops = await prisma.shop.findMany({
    where: { city },
    include: {
      inventory: {
        include: {
          product: {
            include: { category: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({
    success: true,
    message: `Found ${shops.length} shop(s) in ${city}`,
    city,
    count: shops.length,
    shops,
  });
});


export const updateShop = asyncHandler(async (req: Request, res: Response) => {
  const {
    storeName,
    description,
    address,
    city,
    latitude,
    longitude,
    deliveryTime,
    shopId,
  } = req.body;
  const file = req.file;

  const existingShop = await prisma.shop.findUnique({
    where: { id: Number(shopId) },
  });

  if (!existingShop) throw new AppError("Shop not found", 404);

  let storeBanner = existingShop.storeBanner;
  if (file) {
    storeBanner = await uploadImageOnCloudinary(file as Express.Multer.File);
  }

  const updatedShop = await prisma.shop.update({
    where: { id: existingShop.id },
    data: {
      storeName: storeName?.trim() || existingShop.storeName,
      description: description?.trim() || existingShop.description,
      address: address?.trim() || existingShop.address,
      city: city?.trim().toLowerCase() || existingShop.city,
      latitude: latitude ? Number(latitude) : existingShop.latitude,
      longitude: longitude ? Number(longitude) : existingShop.longitude,
      deliveryTime: deliveryTime ? Number(deliveryTime) : existingShop.deliveryTime,
      storeBanner,
    },
  });

  res.status(200).json({
    success: true,
    message: "Shop updated successfully",
    shop: updatedShop,
  });
});

export const getShopOrder = asyncHandler(async (req: Request, res: Response) => {
  const shopId = Number(req.params.shopId);

  const shop = await prisma.shop.findUnique({ where: { id: shopId } });
  if (!shop) throw new AppError("Shop not found", 404);

  const orders = await prisma.order.findMany({
    where: { shopId },
    include: {
      user: true,
      address: true,
      items: { include: { product: true } },
      delivery: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({
    success: true,
    count: orders.length,
    orders,
  });
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { orderStatus } = req.body;

  const validStatuses = [
    "pending",
    "confirmed",
    "preparing",
    "out_for_delivery",
    "delivered",
    "cancelled",
    "failed",
  ];
  if (!validStatuses.includes(orderStatus)) {
    throw new AppError("Invalid order status value", 400);
  }

  const order = await prisma.order.findUnique({ where: { id: Number(orderId) } });
  if (!order) throw new AppError("Order not found", 404);

  const updatedOrder = await prisma.order.update({
    where: { id: Number(orderId) },
    data: { orderStatus },
  });

  res.status(200).json({
    success: true,
    message: `Order status updated to ${orderStatus}`,
    order: updatedOrder,
  });
});


export const getSingleShop = asyncHandler(async (req: Request, res: Response) => {
  const shopId = Number(req.params.id);
  console.log("Getting Shop ID :", shopId);

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    include: {
      owner: {
        select: { fullname: true, email: true, phoneNumber: true },
      },
      inventory: {
        select: {
          id: true,
          price: true,
          quantity: true,
          netQty: true,       
          unit: true,        
          isAvailable: true,

          product: {
            select: {
              id: true,
              name: true,
              description: true,
              brand: true,
              image: true,
              category: true,
            },
          },
        },
      },
    },
  });

  if (!shop) throw new AppError("Shop not found", 404);

  res.status(200).json({
    success: true,
    shop,
  });
});


export const getNearbyShops = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = Number(req.id);

    // ✅ Fetch user and their default address
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
    console.log(user)
    if (!defaultAddress)
      throw new AppError(
        "Default address not found. Please set one before searching nearby shops.",
        400
      );

    if (!defaultAddress.latitude || !defaultAddress.longitude)
      throw new AppError("Default address does not have coordinates set.", 400);

    const userLat = defaultAddress.latitude;
    const userLon = defaultAddress.longitude;

    // ✅ Fetch all shops (could later optimize with raw query)
    const shops = await prisma.shop.findMany({
      include: {
        owner: {
          select: {
            fullname: true,
            email: true,
          },
        },
        inventory: {
          include: {
            product: {
              include: { category: true },
            },
          },
        },
      },
    });

    // ✅ Calculate distance using Haversine formula
    const EARTH_RADIUS_KM = 6371;
    const toRad = (value: number) => (value * Math.PI) / 180;

    const nearbyShops = shops
      .map((shop) => {
        const dLat = toRad(shop.latitude - userLat);
        const dLon = toRad(shop.longitude - userLon);

        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(userLat)) *
            Math.cos(toRad(shop.latitude)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = EARTH_RADIUS_KM * c;
        const deliveryTime = (distance/20)*60 + 15;
        return { ...shop, distance,deliveryTime };
      })
      .filter((s) => s.distance <= 7) // ✅ within 7 km
      .sort((a, b) => a.distance - b.distance); // ✅ sort nearest first
      
    res.status(200).json({
      success: true,
      message: `Found ${nearbyShops.length} shop(s) within 7 km of your location.`,
      userLocation: {
        latitude: userLat,
        longitude: userLon,
      },
      count: nearbyShops.length,
      shops: nearbyShops.map((shop) => ({
        id: shop.id,
        storeName: shop.storeName,
        city: shop.city,
        address: shop.address,
        deliveryTime: shop.deliveryTime.toFixed(0),
        storeBanner: shop.storeBanner,
        latitude: shop.latitude,
        longitude: shop.longitude,
        distance: shop.distance.toFixed(2), 
        owner: shop.owner,
        totalProducts: shop.inventory.length,
      })),
    });
  }
);

