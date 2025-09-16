import { Request, Response } from "express";
import { prisma } from "../db/db"; // Prisma client


type CheckoutSessionRequest = {
  cartItems: {
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    netQty: string;
  }[];
  deliveryDetails: {
    name: string;
    email: string;
    adress: string;
    city: string;
  };
  shopId: string;
  totalAmount: number;
};

// ------------------ GET ORDERS ------------------
export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: Number(req.id) }, // ✅ req.id comes from auth middleware
      include: {
        user: true,
        shop: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};