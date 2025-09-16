import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import cloudinary from "../utils/cloudinary";
import { generateToken } from "../utils/generatToken";
import { prisma } from "../db/db";

/* ---------------------- SIGN UP ---------------------- */
export const signUp = async (req: Request, res: Response): Promise<void> => {
  try {
    let { fullname, email, password, contact } = req.body;

    // check if user exists
    let user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    fullname = fullname.trim();
    contact = contact.trim();
    password = await bcrypt.hash(password, 10);

    // create user
    user = await prisma.user.create({
      data: {
        fullname,
        email,
        password,
        contact, // keep as string since Prisma schema has String
      },
    });

    generateToken(res, user);

    const userWithoutPassword = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        fullname: true,
        email: true,
        contact: true,
        address: true,
        city: true,
        profilePicture: true,
        admin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("❌ SignUp Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* ---------------------- LOGIN ---------------------- */
export const Login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res
        .status(400)
        .json({ success: false, message: "No user found with this email" });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      res.status(400).json({ success: false, message: "Incorrect password" });
      return;
    }

    generateToken(res, user);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() },
    });

    const userWithoutPassword = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        fullname: true,
        email: true,
        contact: true,
        address: true,
        city: true,
        profilePicture: true,
        admin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      message: `Welcome back ${user.fullname}`,
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* ---------------------- LOGOUT ---------------------- */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res
      .clearCookie("token")
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* ---------------------- CHECK AUTH ---------------------- */
export const checkAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.id;
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        id: true,
        fullname: true,
        email: true,
        contact: true,
        address: true,
        city: true,
        profilePicture: true,
        admin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* ---------------------- UPDATE PROFILE ---------------------- */
export const updateUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.id;
    const { fullname, email, contact, address, city, profilePicture } =
      req.body;

    // upload image on cloudinary
    let uploadedImage = null;
    if (profilePicture) {
      const cloudResponse = await cloudinary.uploader.upload(profilePicture);
      uploadedImage = cloudResponse.secure_url;
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        fullname: fullname.trim(),
        email,
        contact,
        address: address.trim(),
        city: city.trim(),
        profilePicture: uploadedImage || profilePicture,
      },
      select: {
        id: true,
        fullname: true,
        email: true,
        contact: true,
        address: true,
        city: true,
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
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Please make sure all the fields are filled correctly",
      });
  }
};

/* ---------------------- TOGGLE ADMIN ---------------------- */
export const toggleAdminStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.id;

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: { admin: !user.admin },
    });

    res.status(200).json({
      success: true,
      message: `User is now ${
        updatedUser.admin ? "an Admin" : "a Normal User"
      }`,
      user: updatedUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
};
