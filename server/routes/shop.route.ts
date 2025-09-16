import express from 'express';
import { createShop, getShop, getShopOrder, getSingleShop, searchProduct, updateOrderStatus, updateShop } from '../controller/shop.controller';
import upload from '../middlewares/multer';
import { isAuthenticated } from '../middlewares/isAuthenticated';

const router = express.Router();

router.route("/").post(isAuthenticated, upload.single("storeBanner"), createShop);
router.route("/").get(isAuthenticated, getShop);
router.route("/").put(isAuthenticated, upload.single("storeBanner"), updateShop);
router.route("/order").get(isAuthenticated, getShopOrder);
router.route("/order/:orderId/status").put(isAuthenticated, updateOrderStatus);
router.route("/search/:searchText").get(isAuthenticated,searchProduct);
router.route("/:id").get(isAuthenticated,getSingleShop);


export default router;