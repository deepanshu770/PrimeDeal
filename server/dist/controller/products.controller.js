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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateShopInventory = exports.addProductToShop = exports.getAllCategories = exports.searchProduct = exports.getAllProducts = exports.getAllProductsInShop = exports.toggleProductAvailability = exports.editProduct = exports.addProduct = void 0;
const imageUpload_1 = __importDefault(require("../utils/imageUpload"));
const db_1 = require("../db/db");
const asyncHandler_1 = require("../utils/asyncHandler");
const client_1 = require("@prisma/client");
// ----------------- Add Product -----------------
const addProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, categoryId, netQty, unit } = req.body;
        const file = req.file;
        if (!file) {
            res.status(400).json({ success: false, message: "No file uploaded" });
            return;
        }
        if (!netQty || !unit) {
            res.status(400).json({
                success: false,
                message: "Net quantity value and unit are required",
            });
            return;
        }
        // ✅ Validate unit enum
        if (!Object.values(client_1.Unit).includes(unit)) {
            res.status(400).json({
                success: false,
                message: `Invalid unit. Must be one of: ${Object.values(client_1.Unit).join(", ")}`,
            });
            return;
        }
        // ✅ Normalize fields
        const trimmedName = name.trim();
        const trimmedDescription = description === null || description === void 0 ? void 0 : description.trim();
        // ✅ Upload product image
        const imageURL = yield (0, imageUpload_1.default)(file);
        // ✅ Check if global product exists
        let product = yield db_1.prisma.product.findFirst({
            where: { name: trimmedName.toLowerCase() },
        });
        if (!product) {
            product = yield db_1.prisma.product.create({
                data: {
                    name: trimmedName,
                    description: trimmedDescription || "",
                    image: imageURL,
                    categoryId: Number(categoryId),
                    netQty: Number(netQty),
                    unit
                },
            });
        }
        res.status(201).json({
            success: true,
            message: "Product added successfully",
            product
        });
    }
    catch (error) {
        console.error("❌ Error adding product:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
exports.addProduct = addProduct;
// ----------------- Edit Product -----------------
const editProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, description, price, categoryId, netQtyValue, unit } = req.body;
        const file = req.file;
        const product = yield db_1.prisma.product.findUnique({ where: { id: Number(id) } });
        if (!product) {
            res.status(404).json({ success: false, message: "Product not found" });
            return;
        }
        // 🏪 Identify shop from authenticated user (replace `req.id` if needed)
        const shop = yield db_1.prisma.shop.findUnique({ where: { id: Number(req.id) } });
        if (!shop) {
            res.status(404).json({ success: false, message: "Shop not found" });
            return;
        }
        // ✅ Check inventory link
        const inventory = yield db_1.prisma.shopInventory.findUnique({
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
            imageURL = yield (0, imageUpload_1.default)(file);
        }
        // ✅ Update product
        const updatedProduct = yield db_1.prisma.product.update({
            where: { id: product.id },
            data: {
                name: name ? name.trim() : product.name,
                description: description ? description.trim() : product.description,
                categoryId: categoryId ? Number(categoryId) : product.categoryId,
                image: imageURL,
            },
        });
        // ✅ Update inventory (price / unit / qty)
        const updatedInventory = yield db_1.prisma.shopInventory.update({
            where: { id: inventory.id },
            data: {
                price: price ? parseFloat(price) : inventory.price,
                netQty: netQtyValue ? parseFloat(netQtyValue) : inventory.netQty,
                unit: unit ? unit : inventory.unit,
            },
        });
        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct,
            inventory: updatedInventory,
        });
    }
    catch (error) {
        console.error("❌ Error editing product:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
exports.editProduct = editProduct;
// ----------------- Toggle Product Availability -----------------
const toggleProductAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const shop = yield db_1.prisma.shop.findUnique({ where: { id: Number(req.id) } });
        if (!shop) {
            res.status(404).json({ success: false, message: "Shop not found" });
            return;
        }
        const inventory = yield db_1.prisma.shopInventory.findUnique({
            where: { shopId_productId: { shopId: shop.id, productId: Number(id) } },
        });
        if (!inventory) {
            res.status(404).json({ success: false, message: "Product not found in shop" });
            return;
        }
        const updated = yield db_1.prisma.shopInventory.update({
            where: { id: inventory.id },
            data: { isAvailable: !inventory.isAvailable },
        });
        res.status(200).json({
            success: true,
            message: updated.isAvailable ? "Product set as available" : "Product set as unavailable",
            inventory: updated,
        });
    }
    catch (error) {
        console.error("❌ Error toggling availability:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
exports.toggleProductAvailability = toggleProductAvailability;
// ----------------- Get All Products in a Shop -----------------
const getAllProductsInShop = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shopId = Number(req.params.shopId);
        const shop = yield db_1.prisma.shop.findUnique({ where: { id: shopId } });
        if (!shop) {
            res.status(404).json({ success: false, message: "Shop not found" });
            return;
        }
        const inventories = yield db_1.prisma.shopInventory.findMany({
            where: { shopId },
            include: {
                product: { include: { category: true } },
            },
        });
        const products = inventories.map((item) => {
            var _a;
            return ({
                id: item.product.id,
                name: item.product.name,
                description: item.product.description,
                category: (_a = item.product.category) === null || _a === void 0 ? void 0 : _a.name,
                image: item.product.image,
                price: item.price,
                quantity: item.quantity,
                netQty: item.netQty,
                unit: item.unit,
                isAvailable: item.isAvailable,
            });
        });
        res.status(200).json({
            success: true,
            count: products.length,
            products,
        });
    }
    catch (error) {
        console.error("❌ Error fetching shop products:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
exports.getAllProductsInShop = getAllProductsInShop;
// ----------------- Get All Products (Global Catalog) -----------------
exports.getAllProducts = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { search, categoryId } = req.query;
    const filters = {};
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
    const products = yield db_1.prisma.product.findMany({
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
}));
// 🔍 Search products with best price + nearby + available filters
exports.searchProduct = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const query = ((_a = req.query.q) === null || _a === void 0 ? void 0 : _a.trim()) || "";
    const userId = Number(req.id);
    const user = yield db_1.prisma.user.findUnique({
        where: { id: userId },
        include: {
            addresses: {
                where: { isDefault: true },
                take: 1,
            },
        },
    });
    if (!user)
        throw new asyncHandler_1.AppError("User not found", 404);
    const address = user.addresses[0];
    if (!address)
        throw new asyncHandler_1.AppError("Default address not found", 400);
    // Constants
    const MAX_DISTANCE_KM = 10; // You can tune this value
    // Helper: filter shops by nearby distance using Haversine formula (SQL raw)
    const nearbyShops = yield db_1.prisma.$queryRawUnsafe(`
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
    const inventories = yield db_1.prisma.shopInventory.findMany({
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
    const bestProductsMap = new Map();
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
        products: bestProducts.map((inv) => {
            var _a, _b;
            return ({
                id: inv.product.id,
                name: inv.product.name,
                description: inv.product.description,
                image: inv.product.image,
                category: (_a = inv.product.category) === null || _a === void 0 ? void 0 : _a.name,
                netQty: inv.product.netQty,
                unit: inv.unit,
                price: inv.price,
                shopName: inv.shop.storeName,
                shopId: inv.shop.id,
                distance: ((_b = nearbyShops.find((s) => s.id === inv.shop.id)) === null || _b === void 0 ? void 0 : _b.distance) || null,
            });
        }),
    });
}));
/**
 * @desc    Get all product categories
 * @route   GET /api/v1/category
 * @access  Public
 */
exports.getAllCategories = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const categories = yield db_1.prisma.category.findMany({
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
}));
exports.addProductToShop = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId, shopId, price, quantity, netQtyValue, unit } = req.body;
    console.log(req.body);
    if (!productId || !shopId || !price || !netQtyValue || !unit) {
        return res.status(400).json({
            success: false,
            message: "Product ID, Shop ID, Price, Net Quantity, and Unit are required",
        });
    }
    const product = yield db_1.prisma.product.findUnique({
        where: { id: Number(productId) },
    });
    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found",
        });
    }
    // ✅ Check shop existence
    const shop = yield db_1.prisma.shop.findUnique({
        where: { id: Number(shopId) },
    });
    if (!shop) {
        return res.status(404).json({
            success: false,
            message: "Shop not found",
        });
    }
    // ✅ Validate unit type against Prisma Enum
    if (!Object.values(client_1.Unit).includes(unit)) {
        return res.status(400).json({
            success: false,
            message: `Invalid unit. Must be one of: ${Object.values(client_1.Unit).join(", ")}`,
        });
    }
    // ✅ Prevent duplicate inventory record
    const existing = yield db_1.prisma.shopInventory.findUnique({
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
    const inventory = yield db_1.prisma.shopInventory.create({
        data: {
            shopId: Number(shopId),
            productId: Number(productId),
            price: parseFloat(price),
            quantity: quantity ? Number(quantity) : 0,
            netQty: parseFloat(netQtyValue),
            unit: unit,
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
}));
exports.updateShopInventory = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { shopId, productId } = req.params;
    const { price, quantity, netQtyValue, unit, isAvailable } = req.body;
    // 1️⃣ Validate shop exists
    const shop = yield db_1.prisma.shop.findUnique({
        where: { id: Number(shopId) },
    });
    if (!shop) {
        throw new asyncHandler_1.AppError("Shop not found", 404);
    }
    // 2️⃣ Ensure the product exists in global catalog
    const product = yield db_1.prisma.product.findUnique({
        where: { id: Number(productId) },
    });
    if (!product) {
        throw new asyncHandler_1.AppError("Product not found in global catalog", 404);
    }
    // 3️⃣ Check shop inventory entry exists
    const inventory = yield db_1.prisma.shopInventory.findUnique({
        where: {
            shopId_productId: {
                shopId: Number(shopId),
                productId: Number(productId),
            },
        },
    });
    if (!inventory) {
        throw new asyncHandler_1.AppError("This product is not in your shop inventory", 403);
    }
    // 4️⃣ Update only shop inventory (NOT global product)
    const updatedInventory = yield db_1.prisma.shopInventory.update({
        where: { id: inventory.id },
        data: {
            price: price ? parseFloat(price) : inventory.price,
            quantity: quantity ? Number(quantity) : inventory.quantity,
            netQty: netQtyValue ? parseFloat(netQtyValue) : inventory.netQty,
            unit: unit ? unit : inventory.unit,
            isAvailable: typeof isAvailable === "boolean" ? isAvailable : inventory.isAvailable,
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
        },
    });
    return res.status(200).json({
        success: true,
        message: "Shop inventory updated successfully",
        inventory: updatedInventory,
    });
}));
