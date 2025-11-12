import { Request, Response } from "express";
import uploadImageOnCloudinary from "../utils/imageUpload";
import { prisma } from "../db/db";
import { AppError, asyncHandler } from "../utils/asyncHandler";
import { Unit } from "@prisma/client";

// ----------------- Add Product -----------------
export const addProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, categoryId, shopId, netQtyValue, unit } = req.body;
    const file = req.file;

    if (!file) {
      res.status(400).json({ success: false, message: "No file uploaded" });
      return;
    }

    if (!netQtyValue || !unit) {
      res.status(400).json({
        success: false,
        message: "Net quantity value and unit are required",
      });
      return;
    }

    // ✅ Validate unit enum
    if (!Object.values(Unit).includes(unit)) {
      res.status(400).json({
        success: false,
        message: `Invalid unit. Must be one of: ${Object.values(Unit).join(", ")}`,
      });
      return;
    }

    // ✅ Validate shop
    const shop = await prisma.shop.findUnique({ where: { id: Number(shopId) } });
    if (!shop) {
      res.status(404).json({ success: false, message: "Shop not found" });
      return;
    }

    // ✅ Normalize fields
    const trimmedName = name.trim();
    const trimmedDescription = description?.trim();

    // ✅ Upload product image
    const imageURL = await uploadImageOnCloudinary(file as Express.Multer.File);

    // ✅ Check if global product exists
    let product = await prisma.product.findFirst({
      where: { name: trimmedName.toLowerCase() },
    });

    if (!product) {
      product = await prisma.product.create({
        data: {
          name: trimmedName,
          description: trimmedDescription || "",
          image: imageURL,
          categoryId: Number(categoryId),
          netQty: `${netQtyValue}${unit}`, // e.g. “500g”
        },
      });
    }

    // ✅ Check inventory duplicate
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

    // ✅ Add to shop inventory
    const inventory = await prisma.shopInventory.create({
      data: {
        shopId: shop.id,
        productId: product.id,
        price: parseFloat(price),
        quantity: 0,
        netQty: parseFloat(netQtyValue),
        unit: unit as Unit,
        isAvailable: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
      inventory,
    });
  } catch (error) {
    console.error("❌ Error adding product:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ----------------- Edit Product -----------------
export const editProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, price, categoryId, netQtyValue, unit } = req.body;
    const file = req.file;

    const product = await prisma.product.findUnique({ where: { id: Number(id) } });
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    // 🏪 Identify shop from authenticated user (replace `req.id` if needed)
    const shop = await prisma.shop.findUnique({ where: { id: Number(req.id) } });
    if (!shop) {
      res.status(404).json({ success: false, message: "Shop not found" });
      return;
    }

    // ✅ Check inventory link
    const inventory = await prisma.shopInventory.findUnique({
      where: { shopId_productId: { shopId: shop.id, productId: product.id } },
    });
    if (!inventory) {
      res.status(403).json({
        success: false,
        message: "You are not authorized to edit this product",
      });
      return;
    }

    // ✅ Upload new image if provided
    let imageURL = product.image;
    if (file) {
      imageURL = await uploadImageOnCloudinary(file as Express.Multer.File);
    }

    // ✅ Update product
    const updatedProduct = await prisma.product.update({
      where: { id: product.id },
      data: {
        name: name ? name.trim() : product.name,
        description: description ? description.trim() : product.description,
        categoryId: categoryId ? Number(categoryId) : product.categoryId,
        image: imageURL,
      },
    });

    // ✅ Update inventory (price / unit / qty)
    const updatedInventory = await prisma.shopInventory.update({
      where: { id: inventory.id },
      data: {
        price: price ? parseFloat(price) : inventory.price,
        netQty: netQtyValue ? parseFloat(netQtyValue) : inventory.netQty,
        unit: unit ? (unit as Unit) : inventory.unit,
      },
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
      inventory: updatedInventory,
    });
  } catch (error) {
    console.error("❌ Error editing product:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
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
      res.status(404).json({ success: false, message: "Product not found in shop" });
      return;
    }

    const updated = await prisma.shopInventory.update({
      where: { id: inventory.id },
      data: { isAvailable: !inventory.isAvailable },
    });

    res.status(200).json({
      success: true,
      message: updated.isAvailable ? "Product set as available" : "Product set as unavailable",
      inventory: updated,
    });
  } catch (error) {
    console.error("❌ Error toggling availability:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ----------------- Get All Products in a Shop -----------------
export const getAllProductsInShop = async (req: Request, res: Response): Promise<void> => {
  try {
    const shopId = Number(req.params.shopId);
    const shop = await prisma.shop.findUnique({ where: { id: shopId } });

    if (!shop) {
      res.status(404).json({ success: false, message: "Shop not found" });
      return;
    }

    const inventories = await prisma.shopInventory.findMany({
      where: { shopId },
      include: {
        product: { include: { category: true } },
      },
    });

    const products = inventories.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      description: item.product.description,
      category: item.product.category?.name,
      image: item.product.image,
      price: item.price,
      quantity: item.quantity,
      netQty: item.netQty,
      unit: item.unit,
      isAvailable: item.isAvailable,
    }));

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("❌ Error fetching shop products:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ----------------- Get All Products (Global Catalog) -----------------
export const getAllProducts = asyncHandler(async (req, res) => {
  const { search, categoryId } = req.query;

  const filters: any = {};

  if (search) {
    filters.OR = [
      { name: { contains: String(search), mode: "insensitive" } },
      { brand: { contains: String(search), mode: "insensitive" } },
      { description: { contains: String(search), mode: "insensitive" } },
    ];
  }

  if (categoryId) {
    filters.categoryId = Number(categoryId);
  }

  const products = await prisma.product.findMany({
    where: filters,
    include: {
      category: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({
    success: true,
    count: products.length,
    products,
  });
});



// 🔍 Search products with best price + nearby + available filters
export const searchProduct = asyncHandler(async (req: Request, res: Response) => {
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
  const address = user.addresses[0];
  if (!address) throw new AppError("Default address not found", 400);

  // Constants
  const MAX_DISTANCE_KM = 10; // You can tune this value

  // Helper: filter shops by nearby distance using Haversine formula (SQL raw)
  const nearbyShops = await prisma.$queryRawUnsafe<any[]>(`
    SELECT id, storeName, latitude, longitude,
    (6371 * acos(
      cos(radians(${address.latitude})) *
      cos(radians(latitude)) *
      cos(radians(longitude) - radians(${address.longitude})) +
      sin(radians(${address.latitude})) *
      sin(radians(latitude))
    )) AS distance
    FROM Shop
    HAVING distance <= ${MAX_DISTANCE_KM}
    ORDER BY distance ASC;
  `);

  const nearbyShopIds = nearbyShops.map((shop) => shop.id);
  if (nearbyShopIds.length === 0) {
    return res.status(200).json({
      success: true,
      message: "No nearby shops found within range",
      products: [],
    });
  }

  // Find available products from those shops with best price
  const inventories = await prisma.shopInventory.findMany({
    where: {
      isAvailable: true,
      shopId: { in: nearbyShopIds },
      product: {
        OR: [
          { name: { contains: query, } },
          { brand: { contains: query, } },
          { description: { contains: query, } },
        ],
      },
    },
    include: {
      shop: true,
      product: {
        include: { category: true },
      },
    },
  });

  if (inventories.length === 0) {
    return res.status(200).json({
      success: true,
      message: "No available products nearby",
      products: [],
    });
  }

  // Group by productId to find best price
  const bestProductsMap = new Map<number, any>();
  for (const inv of inventories) {
    const existing = bestProductsMap.get(inv.productId);
    if (!existing || inv.price < existing.price) {
      bestProductsMap.set(inv.productId, inv);
    }
  }

  const bestProducts = Array.from(bestProductsMap.values());

  return res.status(200).json({
    success: true,
    message: "Best nearby available products fetched successfully",
    count: bestProducts.length,
    products: bestProducts.map((inv) => ({
      id: inv.product.id,
      name: inv.product.name,
      description: inv.product.description,
      image: inv.product.image,
      category: inv.product.category?.name,
      netQty: inv.product.netQty,
      unit: inv.unit,
      price: inv.price,
      shopName: inv.shop.storeName,
      shopId: inv.shop.id,
      distance: nearbyShops.find((s) => s.id === inv.shop.id)?.distance || null,
    })),
  });
});

/**
 * @desc    Get all product categories
 * @route   GET /api/v1/category
 * @access  Public
 */
export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      _count: {
        select: { products: true },
      },
    },
  });

  if (!categories || categories.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No categories found",
      categories: [],
    });
  }

  res.status(200).json({
    success: true,
    count: categories.length,
    categories,
  });
});


export const addProductToShop = asyncHandler(async (req: Request, res: Response) => {
  const { productId, shopId, price, quantity, netQtyValue, unit } = req.body;
  console.log(req.body)
  // ✅ Validate required fields
  if (!productId || !shopId || !price || !netQtyValue || !unit) {
    return res.status(400).json({
      success: false,
      message: "Product ID, Shop ID, Price, Net Quantity, and Unit are required",
    });
  }

  // ✅ Check product existence
  const product = await prisma.product.findUnique({
    where: { id: Number(productId) },
  });
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  // ✅ Check shop existence
  const shop = await prisma.shop.findUnique({
    where: { id: Number(shopId) },
  });
  if (!shop) {
    return res.status(404).json({
      success: false,
      message: "Shop not found",
    });
  }

  // ✅ Validate unit type against Prisma Enum
  if (!Object.values(Unit).includes(unit as Unit)) {
    return res.status(400).json({
      success: false,
      message: `Invalid unit. Must be one of: ${Object.values(Unit).join(", ")}`,
    });
  }

  // ✅ Prevent duplicate inventory record
  const existing = await prisma.shopInventory.findUnique({
    where: {
      shopId_productId: {
        shopId: Number(shopId),
        productId: Number(productId),
      },
    },
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      message: "Product already exists in this shop’s inventory",
    });
  }

  // ✅ Create inventory entry
  const inventory = await prisma.shopInventory.create({
    data: {
      shopId: Number(shopId),
      productId: Number(productId),
      price: parseFloat(price),
      quantity: quantity ? Number(quantity) : 0,
      netQty: parseFloat(netQtyValue),
      unit: unit as Unit,
      isAvailable: true,
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          image: true,
          description: true,
          category: { select: { id: true, name: true } },
        },
      },
      shop: { select: { id: true, storeName: true, city: true } },
    },
  });

  return res.status(201).json({
    success: true,
    message: "✅ Product successfully added to shop inventory",
    inventory,
  });
});
