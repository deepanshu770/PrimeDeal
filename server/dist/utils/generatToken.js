"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const varibles_1 = require("../config/varibles");
const generateToken = (res, user) => {
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, // ✅ Prisma uses "id", not "_id"
    varibles_1.SECRET_KEY, { expiresIn: "1d" });
    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production", // ✅ recommended for security
        maxAge: 24 * 60 * 60 * 1000, // 1 day (matches token expiry)
    });
    return token;
};
exports.generateToken = generateToken;
