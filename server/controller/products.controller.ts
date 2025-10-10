import { Request, Response } from "express";
import uploadImageOnCloudinary from "../utils/imageUpload";
import { prisma } from "../db/db";

// ----------------- Add Product -----------------
export const addProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, netQty, categoryId, shopId } = req.body;
    const file = req.file;

    if (!file) {
      res.status(400).json({ success: false, message: "No file uploaded" });
      return;
    }
    if (!netQty) {
      res.status(400).json({ success: false, message: "Net Quantity is required" });
      return;
    }

    // ✅ Find shop
    const shop = await prisma.shop.findUnique({ where: { id: Number(shopId) } });
    if (!shop) {
      res.status(404).json({ success: false, message: "Shop not found" });
      return;
    }

    // ✅ Normalize fields
    const normalizedName = name.toLowerCase().trim().replace(/\s+/g, "");
    const normalizedNetQty = netQty.toLowerCase().trim().replace(/\s+/g, "");
    const trimmedName = name.trim();
    const trimmedDescription = description?.trim();

    // ✅ Upload image
    const imageURL = await uploadImageOnCloudinary(file as Express.Multer.File);

    // ✅ Check if global product exists
    let product = await prisma.product.findFirst({
      where: { name: normalizedName, netQty: normalizedNetQty },
    });

    if (!product) {
      // Create product globally
      product = await prisma.product.create({
        data: {
          name: trimmedName,
          description: trimmedDescription || "",
          netQty: normalizedNetQty,
          image: imageURL,
          categoryId: Number(categoryId),
        },
      });
    }

    // ✅ Add product to shop inventory
    const existingInventory = await prisma.shopInventory.findUnique({
      where: { shopId_productId: { shopId: shop.id, productId: product.id } },
    });
    if (existingInventory) {
      res.status(400).json({
        success: false,
        message: "Product already exists in this shop",
      });
      return;
    }

    const inventory = await prisma.shopInventory.create({
      data: {
        shopId: shop.id,
        productId: product.id,
        price: parseFloat(price),
        quantity: 0,
        isAvailable: true,
      },
    });

    res.status(201).json({ success: true, message: "Product added successfully", product, inventory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ----------------- Edit Product -----------------
export const editProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, price, netQty, categoryId } = req.body;
    const file = req.file;

    const product = await prisma.product.findUnique({ where: { id: Number(id) } });
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    const shop = await prisma.shop.findUnique({ where: { id: Number(req.id) } });
    if (!shop) {
      res.status(404).json({ success: false, message: "Shop not found" });
      return;
    }

    // ✅ Get inventory for this shop
    const inventory = await prisma.shopInventory.findUnique({
      where: { shopId_productId: { shopId: shop.id, productId: product.id } },
    });
    if (!inventory) {
      res.status(403).json({ success: false, message: "Unauthorized to edit this product" });
      return;
    }

    // ✅ Normalize updated values
    const updatedName = name ? name.trim() : product.name;
    const updatedNetQty = netQty ? netQty.toLowerCase().trim().replace(/\s+/g, "") : product.netQty;
    const updatedDesc = description ? description.trim() : product.description;

    let imageURL = product.image;
    if (file) {
      imageURL = await uploadImageOnCloudinary(file as Express.Multer.File);
    }

    // ✅ Update product globally
    const updatedProduct = await prisma.product.update({
      where: { id: product.id },
      data: {
        name: updatedName,
        description: updatedDesc,
        netQty: updatedNetQty,
        image: imageURL,
        categoryId: categoryId ? Number(categoryId) : product.categoryId,
      },
    });

    // ✅ Update shop inventory if price provided
    let updatedInventory = inventory;
    if (price) {
      updatedInventory = await prisma.shopInventory.update({
        where: { id: inventory.id },
        data: { price: parseFloat(price) },
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
      inventory: updatedInventory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ----------------- Toggle Product Availability -----------------
export const toggleProductAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const shop = await prisma.shop.findUnique({ where: { id: Number(req.id) } });
    if (!shop) {
      res.status(404).json({ success: false, message: "Shop not found" });
      return;
    }

    const inventory = await prisma.shopInventory.findUnique({
      where: { shopId_productId: { shopId: shop.id, productId: Number(id) } },
    });
    if (!inventory) {
      res.status(404).json({ success: false, message: "Product not found in this shop" });
      return;
    }

    const updatedInventory = await prisma.shopInventory.update({
      where: { id: inventory.id },
      data: { isAvailable: !inventory.isAvailable },
    });

    res.status(200).json({
      success: true,
      message: updatedInventory.isAvailable
        ? "Product set as available"
        : "Product set as unavailable",
      inventory: updatedInventory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllProductsInShop = async (req: Request, res: Response): Promise<void> => {
  try {
    const shopId = Number(req.params.id); // shopId from param or logged-in shop

    // ✅ Check if shop exists
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      res.status(404).json({ success: false, message: "Shop not found" });
      return;
    }

    // ✅ Fetch all inventory items for this shop
    const inventories = await prisma.shopInventory.findMany({
      where: { shopId },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    if (inventories.length === 0) {
      res.status(200).json({
        success: true,
        message: "No products found in this shop",
        products: [],
      });
      return;
    }

    // ✅ Format response
    const formattedProducts = inventories.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      description: item.product.description,
      netQty: item.product.netQty,
      image: item.product.image,
      category: item.product.category?.name,
      price: item.price,
      quantity: item.quantity,
      isAvailable: item.isAvailable,
      createdAt: item.product.createdAt,
    }));

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      products: formattedProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const shopId = Number(req.params.shopId); // shopId from param or logged-in shop

    // ✅ Check if shop exists
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      res.status(404).json({ success: false, message: "Shop not found" });
      return;
    }

    // ✅ Fetch all inventory items for this shop
    const inventories = await prisma.shopInventory.findMany({
      where: { shopId },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    if (inventories.length === 0) {
      res.status(200).json({
        success: true,
        message: "No products found in this shop",
        products: [],
      });
      return;
    }

    // ✅ Format response
    const formattedProducts = inventories.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      description: item.product.description,
      netQty: item.product.netQty,
      image: item.product.image,
      category: item.product.category?.name,
      price: item.price,
      quantity: item.quantity,
      isAvailable: item.isAvailable,
      createdAt: item.product.createdAt,
    }));

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      products: formattedProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

