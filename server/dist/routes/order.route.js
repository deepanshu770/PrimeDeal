"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const order_controller_1 = require("../controller/order.controller");
const isAuthenticated_1 = require("../middlewares/isAuthenticated");
const router = express_1.default.Router();
router.post("/checkout", isAuthenticated_1.isAuthenticated, order_controller_1.createOrder);
router.get("/user", isAuthenticated_1.isAuthenticated, order_controller_1.getUserOrders);
router.get("/shop/:shopId", isAuthenticated_1.isAuthenticated, order_controller_1.getShopOrders);
router.get("/:orderId", isAuthenticated_1.isAuthenticated, order_controller_1.getOrderById);
router.put("/:orderId/status", isAuthenticated_1.isAuthenticated, order_controller_1.updateOrderStatus);
exports.default = router;
