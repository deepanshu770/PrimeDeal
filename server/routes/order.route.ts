import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated";
import {  getOrders } from "../controller/order.controller";
const router = express.Router();

router.route("/").get(isAuthenticated,getOrders);


export default router;