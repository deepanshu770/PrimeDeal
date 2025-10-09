import { Request, Response } from "express";
import uploadImageOnCloudinary from "../utils/imageUpload";
import { prisma } from "../db/db"; // your prisma client instance
// ----------------- Add Product -----------------
export const addProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, description, price, netQty,shopId } = req.body;
    const file = req.file;

    if (!file) {
      res.status(400).json({ success: false, message: "No file uploaded" });
      return;
    }
    if (!netQty) {
      res
        .status(400)
        .json({ success: false, message: "Net Quantity is required" });
      return;
    }

    // ✅ Find shop 
    const shop = await prisma.shop.findUnique({
      where: {  id: Number(shopId) },
    });
    if (!shop) {
      res.status(404).json({ success: false, message: "Shop not found" });
      return;
    }

    // ✅ Normalize fields
    const defaultTitle = title.trim();
    const normalizedTitle = title.toLowerCase().trim().replace(/\s+/g, "");
    const normalizedNetQty = netQty.toLowerCase().trim().replace(/\s+/g, "");
    const defaultDescription = description.trim();

    // ✅ Check uniqueness
    const existingProduct = await prisma.product.findFirst({
      where: {
        shopId: shop.id,
        title: normalizedTitle,
        netQty: normalizedNetQty,
      },
    });
    if (existingProduct) {
      res
        .status(400)
        .json({
          success: false,
          message: "Product already exists with same title & netQty",
        });
      return;
    }

    // ✅ Upload image
    const imageURL = await uploadImageOnCloudinary(file as Express.Multer.File);

    const product = await prisma.product.create({
      data: {
        title: normalizedTitle,
        name: defaultTitle,
        description: defaultDescription,
        price: parseFloat(price),
        netQty: normalizedNetQty,
        image: imageURL,
        shopId: shop.id,
      },
    });

    res
      .status(201)
      .json({ success: true, message: "Product added successfully", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ----------------- Edit Product -----------------
export const editProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, price, netQty } = req.body;
    const file = req.file;

    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    const shop = await prisma.shop.findUnique({
      where: { id: Number(req.id) },
    });
    if (!shop) {
      res.status(404).json({ success: false, message: "Shop not found" });
      return;
    }

    if (product.shopId !== shop.id) {
      res
        .status(403)
        .json({ success: false, message: "Unauthorized to edit this product" });
      return;
    }

    // ✅ Normalize updated values
    let updatedTitle = product.title;
    let updatedName = product.name;
    let updatedNetQty = product.netQty;
    let updatedDesc = product.description;

    if (title) {
      updatedName = title.trim();
      updatedTitle = title.toLowerCase().trim().replace(/\s+/g, "");
    }
    if (netQty) {
      updatedNetQty = netQty.toLowerCase().trim().replace(/\s+/g, "");
    }
    if (description) {
      updatedDesc = description.trim();
    }

    // ✅ Check uniqueness inside shop
    const existingProduct = await prisma.product.findFirst({
      where: {
        shopId: shop.id,
        title: updatedTitle,
        netQty: updatedNetQty,
        NOT: { id: product.id },
      },
    });
    if (existingProduct) {
      res
        .status(400)
        .json({
          success: false,
          message: "Another product already exists with same title & netQty",
        });
      return;
    }

    let imageURL = product.image;
    if (file) {
      imageURL = await uploadImageOnCloudinary(file as Express.Multer.File);
    }

    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        title: updatedTitle,
        name: updatedName,
        description: updatedDesc,
        price: price ? parseFloat(price) : product.price,
        netQty: updatedNetQty,
        image: imageURL,
      },
    });

    res
      .status(200)
      .json({
        success: true,
        message: "Product updated successfully",
        product: updatedProduct,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ----------------- Remove Product (toggle stock) -----------------
export const removeProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    const shop = await prisma.shop.findUnique({
      where: { id: Number(req.id) },
    });
    if (!shop) {
      res.status(404).json({ success: false, message: "Shop not found" });
      return;
    }

    if (product.shopId !== shop.id) {
      res
        .status(403)
        .json({
          success: false,
          message: "Unauthorized to update this product",
        });
      return;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: product.id },
      data: { outOfStock: !product.outOfStock },
    });

    res.status(200).json({
      success: true,
      message: updatedProduct.outOfStock
        ? "Product set as Out of Stock"
        : "Product added Back in Stock",
      product: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
