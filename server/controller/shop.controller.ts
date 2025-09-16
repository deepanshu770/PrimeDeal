import { Request, Response } from "express";
import { prisma } from "../db/db"; // your Prisma client import
import uploadImageOnCloudinary from "../utils/imageUpload";

// ------------------ CREATE SHOP ------------------
export const createShop = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { storeName, city, address, deliveryTime, productCategory } =
      req.body;
    const file = req.file;

    // check if shop already exists
    const existingShop = await prisma.shop.findFirst({
      where: { userId: Number(req.id) },
    });
    if (existingShop) {
      res
        .status(400)
        .json({ success: false, message: "Shop already exists for this user" });
      return;
    }

    if (!file) {
      res
        .status(400)
        .json({
          success: false,
          message: "Please upload a store banner image",
        });
      return;
    }

    const defaultName = storeName.trim();
    const processedStoreName = storeName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "");
    const defaultCityName = city.trim();
    const processedCityName = city.toLowerCase().trim().replace(/\s+/g, "");
    const defaultAddress = address.trim();
    const defaultDeliveryTime = Number(deliveryTime.trim());

    const storeBanner = await uploadImageOnCloudinary(
      file as Express.Multer.File
    );

    const categories = JSON.parse(productCategory || "[]");

    await prisma.shop.create({
      data: {
        userId: Number(req.id),
        storeName: processedStoreName,
        name: defaultName,
        city: processedCityName,
        cityName: defaultCityName,
        address: defaultAddress,
        deliveryTime: defaultDeliveryTime,
        storeBanner,
        productCategories: {
          create: categories.map((cat: string) => ({ name: cat })),
        },
      },
    });

    res.status(201).json({ success: true, message: "Shop added successfully" });
  } catch (error) {
    console.error("Error creating shop:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ------------------ GET SHOP ------------------
export const getShop = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log(req.id)
    const shop = await prisma.shop.findUnique({
      where: { id: Number(req.id) },
      include: {
        products: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!shop) {
      res
        .status(404)
        .json({ success: false, message: "Shop not found", shop: [] });
      return;
    }

    res.status(200).json({ success: true, shop });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ------------------ UPDATE SHOP ------------------
export const updateShop = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { storeName, city, address, deliveryTime, productCategory } =
      req.body;
    const file = req.file;

    const shop = await prisma.shop.findFirst({
      where: { userId: Number(req.id) },
    });
    if (!shop) {
      res.status(404).json({ success: false, message: "Shop not found" });
      return;
    }

    const defaultName = storeName.trim();
    const processedStoreName = storeName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "");
    const defaultCityName = city.trim();
    const processedCityName = city.toLowerCase().trim().replace(/\s+/g, "");
    const defaultAddress = address.trim();
    const defaultDeliveryTime = deliveryTime.trim();

    let bannerUrl = shop.storeBanner;
    if (file) {
      bannerUrl = await uploadImageOnCloudinary(file as Express.Multer.File);
    }

    const categories = JSON.parse(productCategory || "[]");

    // ✅ Update shop and categories (clear old ones first)
    const updatedShop = await prisma.shop.update({
      where: { id: shop.id },
      data: {
        storeName: processedStoreName,
        name: defaultName,
        city: processedCityName,
        cityName: defaultCityName,
        address: defaultAddress,
        deliveryTime: defaultDeliveryTime,
        storeBanner: bannerUrl,
        productCategories: {
          deleteMany: {}, // clear old categories
          create: categories.map((cat: string) => ({ name: cat })),
        },
      },
      include: { productCategories: true },
    });

    res
      .status(200)
      .json({
        success: true,
        message: "Shop updated successfully",
        shop: updatedShop,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Please make sure all fields are filled correctly" });
  }
};

// ------------------ GET SHOP ORDERS ------------------
export const getShopOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const shop = await prisma.shop.findUnique({
      where: { id: Number(req.id) },
    });
    if (!shop) {
      res.status(404).json({ success: false, message: "Shop not found" });
      return;
    }

    const shopOrder = await prisma.order.findMany({
      where: { shopId: shop.id },
      include: { shop: true, user: true },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, shopOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ------------------ UPDATE ORDER STATUS ------------------
export const updateOrderStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
    });
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: Number(orderId) },
      data: { status },
    });

    res
      .status(200)
      .json({
        success: true,
        message: "Order status updated",
        status: updatedOrder.status,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ------------------ SEARCH PRODUCTS ------------------
export const searchProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const searchText = (req.params.searchText || "").trim();
    const searchQuery = (req.query.searchQuery as string) || "";

    const user = await prisma.user.findUnique({
      where: { id: Number(req.id) },
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const userCity = user.city;

    const shops = await prisma.shop.findMany({
      where: {
        city: userCity,
        OR: [
          { name: { contains: searchText } },
          { storeName: { contains: searchText } },
          { productCategories: { some: { name: { contains: searchText } } } },
          { name: { contains: searchQuery } },
          { storeName: { contains: searchQuery } },
          { productCategories: { some: { name: { contains: searchQuery } } } },
        ],
      },
      include: {
        products: {
          where: {
            OR: [
              { title: { contains: searchText } },
              { name: { contains: searchText } },
              { title: { contains: searchQuery } },
              { name: { contains: searchQuery } },
            ],
          },
        },
        productCategories: true,
      },
    });

    res.status(200).json({ success: true, data: shops });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ------------------ GET SINGLE SHOP ------------------
export const getSingleShop = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const shopId = req.params.id;

    const shop = await prisma.shop.findUnique({
      where: { id: Number(shopId) },
      include: {
        products: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!shop) {
      res.status(404).json({ success: false, message: "Shop not found" });
      return;
    }

    res.status(200).json({ success: true, shop });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
