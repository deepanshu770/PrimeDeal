"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const shop_controller_1 = require("../controller/shop.controller");
const multer_1 = __importDefault(require("../middlewares/multer"));
const isAuthenticated_1 = require("../middlewares/isAuthenticated");
const router = express_1.default.Router();
router.route("/").post(isAuthenticated_1.isAuthenticated, multer_1.default.single("storeBanner"), shop_controller_1.createShop);
router.route("/").get(isAuthenticated_1.isAuthenticated, shop_controller_1.getShop);
router.route("/").put(isAuthenticated_1.isAuthenticated, multer_1.default.single("storeBanner"), shop_controller_1.updateShop);
router.get("/nearby", isAuthenticated_1.isAuthenticated, shop_controller_1.getNearbyShops); // ✅ new route
router.route("/order").get(isAuthenticated_1.isAuthenticated, shop_controller_1.getShopOrder);
router.route("/order/:orderId/status").put(isAuthenticated_1.isAuthenticated, shop_controller_1.updateOrderStatus);
router.route("/:id").get(isAuthenticated_1.isAuthenticated, shop_controller_1.getSingleShop);
exports.default = router;
