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
exports.isAuthenticated = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const varibles_1 = require("../config/varibles");
const isAuthenticated = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies.token;
        console.log("Token : ", token);
        if (!token) {
            res.status(401).json({ success: false, message: " User Unauthorized" });
            return;
        }
        //verify token
        const decode = jsonwebtoken_1.default.verify(token, varibles_1.SECRET_KEY);
        //check if decoding is successful
        if (!decode) {
            res.status(401).json({ success: false, message: "Invalid token" });
            return;
        }
        req.id = decode.userId;
        next();
    }
    catch (error) {
        console.log("Middleware Error : ", error);
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
    }
});
exports.isAuthenticated = isAuthenticated;
