import express from 'express';
import upload from '../middlewares/multer';
import { isAuthenticated } from '../middlewares/isAuthenticated';
import { addProduct, editProduct, removeProduct } from '../controller/products.controller';

const router = express.Router();

router.route("/").post(isAuthenticated, upload.single("image"), addProduct);
router.route("/:id").put(isAuthenticated, upload.single("image"), editProduct);
router.route("/:id").patch(isAuthenticated, removeProduct)



export default router;