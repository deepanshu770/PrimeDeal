import { z } from "zod";

{/* User Signup Schema */}

export const userSignupSchema = z.object({
    fullname: z.string().trim().min(3, "Full name is too short").max(50, "Full name is too long").regex(/^[A-Za-z\s]+$/, "Full name must contain only letters and spaces"),
    email: z.string().trim().email("Invalid email address"),
    password: z.string().trim().min(6, "Password must be at least 6 characters").max(30, "Password must be at most 15 characters"),
    contact: z.string().trim()
    .min(10, "Enter a valid contact number with exactly 10 digits")
    .max(10, "Enter a valid contact number with exactly 10 digits")
    .regex(/^\d{10}$/, " / Invalid"),
    admin:z.boolean(),
});

export type SignupInputState = z.infer<typeof userSignupSchema>;


{/* User Login Schema */}

export const userLoginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters").max(30),
});

export type LoginInputState = z.infer<typeof userLoginSchema>;


{/* Uer Profile Schema */}
export const userProfileSchema = z.object({
    fullname: z.string().trim().min(3, "Full name is too short").max(50, "Full name is too long").regex(/^[A-Za-z\s]+$/, " / Full name must contain only letters and spaces"),
    email: z.string().email("Invalid email address"),
    contact: z.string().trim()
    .min(10, "Enter a valid contact number with exactly 10 digits")
    .max(10, "Enter a valid contact number with exactly 10 digits")
    .regex(/^\d{10}$/, " / Invalid"),
    profilePicture:z.string().optional()
});

export type ProfileInputState = z.infer<typeof userProfileSchema>;