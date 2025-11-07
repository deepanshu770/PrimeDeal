import express from 'express';
import upload from '../middlewares/multer';
import { isAuthenticated } from '../middlewares/isAuthenticated';
import { addProduct, editProduct, getAllProducts, getAllProductsInShop, searchProduct } from '../controller/products.controller';

const router = express.Router();

router.route("/").post(isAuthenticated, upload.single("image"), addProduct);
router.route("/:id").put(isAuthenticated, upload.single("image"), editProduct);
router.get("/shop/:shopId",isAuthenticated, getAllProductsInShop);
router.get("/catalog", getAllProducts); 
router.route("/search").get(isAuthenticated,searchProduct);


export default router;