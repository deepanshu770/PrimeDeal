import express from 'express';
import { checkAuth, Login, logout, signUp, updateUserProfile } from '../controller/user.controller';
import { isAuthenticated } from '../middlewares/isAuthenticated';

const userRoute = express.Router();

userRoute.route('/checkauth').get(isAuthenticated,checkAuth);
userRoute.route('/signup').post(signUp);
userRoute.route('/login').post(Login);
userRoute.route('/logout').post(logout);
userRoute.route('/profile/update').put(isAuthenticated,updateUserProfile);


export default userRoute;
