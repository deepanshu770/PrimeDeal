import express from 'express';
import { isAuthenticated } from '../middlewares/isAuthenticated';
// import { addProduct, editProduct } from '../controller/products.controller';
import { addAddress, deleteAddress, listAddresses, setDefaultAddress, updateAddress } from '../controller/address.controller';

const router = express.Router();

router.route("/").post(isAuthenticated, addAddress);
router.route("/:id").delete(isAuthenticated,deleteAddress);
router.route("/:id").put(isAuthenticated, updateAddress)
router.route("/").get(isAuthenticated, listAddresses)
router.route("/set-default/:id").post(isAuthenticated, setDefaultAddress)



export default router;