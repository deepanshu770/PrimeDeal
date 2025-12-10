import express from 'express';
import { checkAuth, login, logout, signUp, updateUserProfile } from '../controller/user.controller';
import { isAuthenticated } from '../middlewares/isAuthenticated';

const userRoute = express.Router();

userRoute.route('/checkauth').get(isAuthenticated,checkAuth);
userRoute.route('/signup').post(signUp);
userRoute.route('/login').post(login);
userRoute.route('/logout').post(logout);
userRoute.route('/profile/update').put(isAuthenticated,updateUserProfile);


export default userRoute;
