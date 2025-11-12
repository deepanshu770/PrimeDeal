import express from 'express';
import upload from '../middlewares/multer';
import { isAuthenticated } from '../middlewares/isAuthenticated';
import { addProduct, addProductToShop, editProduct, getAllCategories, getAllProducts, getAllProductsInShop, searchProduct } from '../controller/products.controller';

const router = express.Router();

router.route("/").post(isAuthenticated, upload.single("image"), addProduct);
router.route("/:id").put(isAuthenticated, upload.single("image"), editProduct);
router.get("/shop/:shopId",isAuthenticated, getAllProductsInShop);
router.get("/catalog", getAllProducts); 
router.route("/search").get(isAuthenticated,searchProduct);
router.get("/category", getAllCategories);
router.post("/add-to-shop", addProductToShop);
export default router;