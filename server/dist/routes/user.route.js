"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controller/user.controller");
const isAuthenticated_1 = require("../middlewares/isAuthenticated");
const userRoute = express_1.default.Router();
userRoute.route('/checkauth').get(isAuthenticated_1.isAuthenticated, user_controller_1.checkAuth);
userRoute.route('/signup').post(user_controller_1.signUp);
userRoute.route('/login').post(user_controller_1.Login);
userRoute.route('/logout').post(user_controller_1.logout);
userRoute.route('/profile/update').put(isAuthenticated_1.isAuthenticated, user_controller_1.updateUserProfile);
exports.default = userRoute;
