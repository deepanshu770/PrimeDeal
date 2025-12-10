"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("../middlewares/multer"));
const isAuthenticated_1 = require("../middlewares/isAuthenticated");
const products_controller_1 = require("../controller/products.controller");
const router = express_1.default.Router();
router.route("/").post(isAuthenticated_1.isAuthenticated, multer_1.default.single("image"), products_controller_1.addProduct);
router.route("/:id").put(isAuthenticated_1.isAuthenticated, multer_1.default.single("image"), products_controller_1.editProduct);
router.put("/shop/:shopId/product/:productId", isAuthenticated_1.isAuthenticated, products_controller_1.updateShopInventory);
router.get("/shop/:shopId", isAuthenticated_1.isAuthenticated, products_controller_1.getAllProductsInShop);
router.get("/catalog", products_controller_1.getAllProducts);
router.route("/search").get(isAuthenticated_1.isAuthenticated, products_controller_1.searchProduct);
router.get("/category", products_controller_1.getAllCategories);
router.post("/add-to-shop", products_controller_1.addProductToShop);
exports.default = router;
