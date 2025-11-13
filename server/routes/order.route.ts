import express from "express";
import {
  createOrder,
  getUserOrders,
  getShopOrders,
  getOrderById,
  updateOrderStatus,
} from "../controller/order.controller";
import { isAuthenticated } from "../middlewares/isAuthenticated";

const router = express.Router();

router.post("/checkout", isAuthenticated, createOrder);

router.get("/user", isAuthenticated, getUserOrders);

router.get("/shop/:shopId", isAuthenticated, getShopOrders);

router.get("/:orderId", isAuthenticated, getOrderById);

router.put("/:orderId/status", isAuthenticated, updateOrderStatus);

export default router;
