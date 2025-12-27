"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.checkAuth = exports.logout = exports.login = exports.signUp = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const generatToken_1 = require("../utils/generatToken");
const db_1 = require("../db/db");
const asyncHandler_1 = require("../utils/asyncHandler");
/* ---------------------- SIGN UP ---------------------- */
exports.signUp = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { fullname, email, password, contact, admin } = req.body;
    if (!fullname || !email || !password || !contact) {
        throw new asyncHandler_1.AppError("All fields are required", 400);
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new asyncHandler_1.AppError("Invalid email format", 400);
    }
    if (password.length < 6) {
        throw new asyncHandler_1.AppError("Password must be at least 6 characters long", 400);
    }
    // check if user exists
    const existingUser = yield db_1.prisma.user.findUnique({ where: { email } });
    if (existingUser)
        throw new asyncHandler_1.AppError("User already exists", 400);
    fullname = fullname.trim();
    contact = contact.trim();
    const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
    // create user
    const user = yield db_1.prisma.user.create({
        data: {
            fullname,
            email,
            passwordHash: hashedPassword,
            phoneNumber: contact,
            admin,
        },
        select: {
            id: true,
            fullname: true,
            email: true,
            phoneNumber: true,
            profilePicture: true,
            admin: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    (0, generatToken_1.generateToken)(res, user); // Type assertion if generateToken expects full User model
    res.status(201).json({
        success: true,
        message: "Account created successfully",
        user,
    });
}));
/* ---------------------- LOGIN ---------------------- */
exports.login = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new asyncHandler_1.AppError("Email and password are required", 400);
    }
    const user = yield db_1.prisma.user.findUnique({ where: { email } });
    if (!user)
        throw new asyncHandler_1.AppError("No user found with this email", 400);
    const isPasswordCorrect = yield bcryptjs_1.default.compare(password, user.passwordHash);
    if (!isPasswordCorrect)
        throw new asyncHandler_1.AppError("Incorrect Password", 400);
    (0, generatToken_1.generateToken)(res, user);
    // Update last login
    const loggedInUser = yield db_1.prisma.user.update({
        where: { id: user.id },
        data: { updatedAt: new Date() },
        select: {
            id: true,
            fullname: true,
            email: true,
            phoneNumber: true,
            profilePicture: true,
            admin: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    res.status(200).json({
        success: true,
        message: `Welcome back ${user.fullname}`,
        user: loggedInUser,
    });
}));
/* ---------------------- LOGOUT ---------------------- */
exports.logout = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res
        .clearCookie("token")
        .status(200)
        .json({ success: true, message: "Logged out successfully" });
}));
/* ---------------------- CHECK AUTH ---------------------- */
exports.checkAuth = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.id;
    const user = yield db_1.prisma.user.findUnique({
        where: { id: Number(userId) },
        select: {
            id: true,
            fullname: true,
            email: true,
            phoneNumber: true,
            profilePicture: true,
            admin: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    if (!user)
        throw new asyncHandler_1.AppError("User not found", 404);
    res.status(200).json({ success: true, user });
}));
/* ---------------------- UPDATE PROFILE ---------------------- */
exports.updateUserProfile = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.id;
    const { fullname, email, contact, profilePicture } = req.body;
    if (!fullname || !email || !contact) {
        throw new asyncHandler_1.AppError("Fullname, email, and contact are required", 400);
    }
    const currentUser = yield db_1.prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!currentUser)
        throw new asyncHandler_1.AppError("User not found", 404);
    if (email !== currentUser.email) {
        const existingUser = yield db_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new asyncHandler_1.AppError("Email already in use", 400);
        }
    }
    // upload image on cloudinary
    let uploadedImage = currentUser.profilePicture;
    if (profilePicture && profilePicture.startsWith("data:")) {
        try {
            const cloudResponse = yield cloudinary_1.default.uploader.upload(profilePicture);
            uploadedImage = cloudResponse.secure_url;
        }
        catch (error) {
            throw new asyncHandler_1.AppError("Failed to upload image", 500);
        }
    }
    const updatedUser = yield db_1.prisma.user.update({
        where: { id: Number(userId) },
        data: {
            fullname: fullname.trim(),
            email,
            phoneNumber: contact,
            profilePicture: uploadedImage,
        },
        select: {
            id: true,
            fullname: true,
            email: true,
            phoneNumber: true,
            profilePicture: true,
            admin: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
    });
}));
