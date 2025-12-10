"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const isAuthenticated_1 = require("../middlewares/isAuthenticated");
// import { addProduct, editProduct } from '../controller/products.controller';
const address_controller_1 = require("../controller/address.controller");
const router = express_1.default.Router();
router.route("/").post(isAuthenticated_1.isAuthenticated, address_controller_1.addAddress);
router.route("/:id").delete(isAuthenticated_1.isAuthenticated, address_controller_1.deleteAddress);
router.route("/:id").put(isAuthenticated_1.isAuthenticated, address_controller_1.updateAddress);
router.route("/").get(isAuthenticated_1.isAuthenticated, address_controller_1.listAddresses);
router.route("/set-default/:id").post(isAuthenticated_1.isAuthenticated, address_controller_1.setDefaultAddress);
exports.default = router;
