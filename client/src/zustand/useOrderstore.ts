// src/zustand/useOrderStore.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { Order, OrderStatus } from "@/types/orderType";

// ✅ Axios instance (centralized config)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ✅ Centralized API error handler
export const handleApiError = (error: unknown, defaultMessage?: string) => {
  let message = defaultMessage || "Something went wrong";

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    if (axiosError.response?.data?.message) {
      message = axiosError.response.data.message;
    } else if (axiosError.message) {
      message = axiosError.message;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  toast.error(message);
  console.error("❌ API Error:", message);
};

/* ===========================================================
   🧾 ORDER STORE
=========================================================== */
interface OrderState {
  loading: boolean;
  orders: Order[];
  shopOrders: Order[];
  singleOrder: Order | null;

  /** Create a new order (multi-shop checkout supported) */
  createOrder: (payload: {
    cartItems: any[];
    addressId: number;
  }) => Promise<void>;

  /** Get logged-in user's orders */
  getUserOrders: () => Promise<void>;

  /** Get all orders of a shop (for shop owner dashboard) */
  getShopOrders: (shopId: number) => Promise<void>;

  /** Get detailed order info by ID */
  getOrderById: (orderId: number) => Promise<void>;

  /** Update order status (shop/admin only) */
  updateOrderStatus: (orderId: number, status: OrderStatus) => Promise<void>;

  /** Clear all orders from local storage */
  clearOrders: () => void;
}

/* ===========================================================
   🧠 STORE IMPLEMENTATION
=========================================================== */
export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      loading: false,
      orders: [],
      shopOrders: [],
      singleOrder: null,

      /** 🧾 Create Order */
      createOrder: async ({ cartItems, addressId }) => {
        set({ loading: true });
        try {
          const res = await api.post("/order/checkout", {
            cartItems,
            addressId,
          });
          if (res.data.success) {
            toast.success(res.data.message || "Order placed successfully ✅");
            set((state) => ({
              orders: [...res.data.orders, ...state.orders],
            }));
          }
        } catch (error) {
          handleApiError(error, "Failed to place order");
        } finally {
          set({ loading: false });
        }
      },

      /** 👤 Fetch all user orders */
      getUserOrders: async () => {
        set({ loading: true });
        try {
          const res = await api.get("/order/user");
          if (res.data.success) {
            set({ orders: res.data.orders });
          }
        } catch (error) {
          handleApiError(error, "Unable to fetch your orders");
        } finally {
          set({ loading: false });
        }
      },

      /** 🏪 Fetch shop orders */
      getShopOrders: async (shopId) => {
        set({ loading: true });
        try {
          const res = await api.get(`/order/shop/${shopId}`);
          if (res.data.success) {
            set({ shopOrders: res.data.orders });
          }
        } catch (error) {
          handleApiError(error, "Unable to fetch shop orders");
        } finally {
          set({ loading: false });
        }
      },

      /** 🔍 Fetch a single order by ID */
      getOrderById: async (orderId) => {
        set({ loading: true, singleOrder: null });
        try {
          const res = await api.get(`/order/${orderId}`);
          if (res.data.success) {
            set({ singleOrder: res.data.order });
          } else {
            toast.error("Failed to fetch order details");
          }
        } catch (err: any) {
          console.error("Order fetch error:", err);
          toast.error(err?.response?.data?.message || "Failed to load order");
        } finally {
          set({ loading: false });
        }
      },
      /** 🔄 Update order status */
      updateOrderStatus: async (orderId, status) => {
        try {
          const res = await api.put(`/order/${orderId}/status`, { status });
          if (res.data.success) {
            toast.success(res.data.message);
            set((state) => ({
              shopOrders: state.shopOrders.map((order) =>
                order.id === orderId ? { ...order, orderStatus: status } : order
              ),
            }));
          }
        } catch (error) {
          handleApiError(error, "Failed to update order status");
        }
      },

      /** 🧹 Clear local order cache */
      clearOrders: () => {
        localStorage.removeItem("prime-deal-orders");
        set({ orders: [], shopOrders: [], singleOrder: null });
      },
    }),
    {
      name: "prime-deal-orders",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
