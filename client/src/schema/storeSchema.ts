import {z} from "zod";

{/* Store Schema */}

export const storeSchema = z.object({
    storeName: z.string().trim().min(3, "Store name is too short").max(20, "Store name is too long").regex(/^[A-Za-z\s]+$/, " / Store name must contain only letters and spaces"),
    address: z.string().trim().min(6, "Address must be at least 6 characters").max(200, "Address must be at most 200 characters").regex(/^[A-Za-z0-9\s,./]+$/, " / Address can only contain letters, numbers, spaces, ','"),
    city: z.string().trim().min(3, "City must be at least 3 characters").max(20, "City must be at most 50 characters").regex(/^[A-Za-z\s]+$/, " / City must contain only letters and spaces"),
    deliveryTime: z.number().min(5, "Delivery time must be at least 5 minutes ").max(100, "Delivery time must be at most 100 minutes"),
    products: z.array(z.string().regex(/^[A-Za-z\s,]+$/, "Address can only contain letters, ','")).min(1, "At least 1 product is required"),
    storeBanner: z
  .instanceof(File)
  .optional()
  .refine((file) => file?.size !== 0,{message:"Please upload a product image"})
});

export type StoreInfoSchema = z.infer<typeof storeSchema>;