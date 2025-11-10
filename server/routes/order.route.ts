import express from "express";
import { createOrder, getUserOrders, getShopOrders, getOrderById } from "../controller/order.controller";
import { updateOrderStatus } from "../controller/shop.controller";
import { isAuthenticated } from "../middlewares/isAuthenticated";


const router = express.Router();

// 🧾 Create a new order (Checkout)
router.post("/checkout", isAuthenticated, createOrder);

// 👤 Get logged-in user's all orders
router.get("/user", isAuthenticated, getUserOrders);

// 🏪 Get orders for a shop owner
router.get("/shop/:shopId", isAuthenticated, getShopOrders);

// 🔍 Get single order details
router.get("/:orderId", isAuthenticated, getOrderById);

// 🔄 Update order status (for shop owner or admin)
router.put("/:orderId/status", isAuthenticated, updateOrderStatus);

export default router;
