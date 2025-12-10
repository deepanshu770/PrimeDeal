import bcrypt from "bcryptjs";
import cloudinary from "../utils/cloudinary";
import { generateToken } from "../utils/generatToken";
import { prisma } from "../db/db";
import { AppError, asyncHandler } from "../utils/asyncHandler";

/* ---------------------- SIGN UP ---------------------- */
export const signUp = asyncHandler(async (req, res) => {
  let { fullname, email, password, contact } = req.body;

  if (!fullname || !email || !password || !contact) {
    throw new AppError("All fields are required", 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError("Invalid email format", 400);
  }

  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters long", 400);
  }

  // check if user exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new AppError("User already exists", 400);

  fullname = fullname.trim();
  contact = contact.trim();
  const hashedPassword = await bcrypt.hash(password, 10);

  // create user
  const user = await prisma.user.create({
    data: {
      fullname,
      email,
      passwordHash: hashedPassword,
      phoneNumber: contact,
      admin: false, // Default to false for security
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

  generateToken(res, user as any); // Type assertion if generateToken expects full User model

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    user,
  });
});

/* ---------------------- LOGIN ---------------------- */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError("No user found with this email", 400);

  const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordCorrect) throw new AppError("Incorrect Password", 400);

  generateToken(res, user);

  // Update last login
  const loggedInUser = await prisma.user.update({
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
});

/* ---------------------- LOGOUT ---------------------- */
export const logout = asyncHandler(async (req, res) => {
  res
    .clearCookie("token")
    .status(200)
    .json({ success: true, message: "Logged out successfully" });
});

/* ---------------------- CHECK AUTH ---------------------- */
export const checkAuth = asyncHandler(async (req, res) => {
  const userId = req.id;
  const user = await prisma.user.findUnique({
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

  if (!user) throw new AppError("User not found", 404);

  res.status(200).json({ success: true, user });
});

/* ---------------------- UPDATE PROFILE ---------------------- */
export const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.id;
  const { fullname, email, contact, profilePicture } = req.body;

  if (!fullname || !email || !contact) {
    throw new AppError("Fullname, email, and contact are required", 400);
  }

  const currentUser = await prisma.user.findUnique({ where: { id: Number(userId) } });
  if (!currentUser) throw new AppError("User not found", 404);

  if (email !== currentUser.email) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError("Email already in use", 400);
    }
  }

  // upload image on cloudinary
  let uploadedImage = currentUser.profilePicture;
  if (profilePicture && profilePicture.startsWith("data:")) {
    try {
      const cloudResponse = await cloudinary.uploader.upload(profilePicture);
      uploadedImage = cloudResponse.secure_url;
    } catch (error) {
      throw new AppError("Failed to upload image", 500);
    }
  }

  const updatedUser = await prisma.user.update({
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
});

