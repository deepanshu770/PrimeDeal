import { Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "@prisma/client"; // Prisma auto-generated types
import { SECRET_KEY } from "../config/varibles";

export const generateToken = (res: Response, user: User) => {
  const token = jwt.sign(
    { userId: user.id }, // ✅ Prisma uses "id", not "_id"
    SECRET_KEY,
    { expiresIn: "1d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production", // ✅ recommended for security
    maxAge: 24 * 60 * 60 * 1000, // 1 day (matches token expiry)
  });

  return token;
};
