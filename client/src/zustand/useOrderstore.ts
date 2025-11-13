import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { Order, OrderStatus } from "../../../types/types";
import API from "@/config/api";



const handleApiError = (
  error: unknown,
  defaultMessage = "Something went wrong"
) => {
  let message = defaultMessage;

  if (axios.isAxiosError(error)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as AxiosError<any>;
    message =
      err.response?.data?.message ||
      err.message ||
      err.response?.statusText ||
      defaultMessage;
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

  createOrder: (payload: {
    cartItems: any[];
    addressId: number;
  }) => Promise<void>;
  getUserOrders: () => Promise<void>;
  getShopOrders: (shopId: number) => Promise<void>;
  getOrderById: (orderId: number) => Promise<void>;
  updateOrderStatus: (orderId: number, status: OrderStatus) => Promise<void>;
  clearOrders: () => void;
}

/* ===========================================================
   🧠 IMPLEMENTATION
=========================================================== */
export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      loading: false,
      orders: [],
      shopOrders: [],
      singleOrder: null,

      /** 🧾 CREATE ORDER */
      createOrder: async ({ cartItems, addressId }) => {
        set({ loading: true });
        try {
          const res = await API.post("/order/checkout", {
            cartItems,
            addressId,
          });
          if (res.data.success) {
            toast.success(res.data.message || "Order placed successfully ✅");
            set((state) => ({
              orders: [...res.data.orders, ...state.orders],
            }));
          } else {
            toast.error(res.data.message || "Failed to place order");
          }
        } catch (error) {
          handleApiError(error, "Failed to place order");
        } finally {
          set({ loading: false });
        }
      },

      /** 👤 FETCH USER ORDERS */
      getUserOrders: async () => {
        set({ loading: true });
        try {
          const res = await API.get("/order/user");
          if (res.data.success) {
            set({ orders: res.data.orders });
          } else {
            toast.error("Failed to load orders");
          }
        } catch (error) {
          handleApiError(error, "Unable to fetch orders");
        } finally {
          set({ loading: false });
        }
      },

      /** 🏪 FETCH SHOP ORDERS */
      getShopOrders: async (shopId) => {
        set({ loading: true });
        try {
          const res = await API.get(`/order/shop/${shopId}`);
          if (res.data.success) {
            set({ shopOrders: res.data.orders });
          } else {
            toast.error("Failed to fetch shop orders");
          }
        } catch (error) {
          handleApiError(error, "Unable to fetch shop orders");
        } finally {
          set({ loading: false });
        }
      },

      /** 🔍 FETCH SINGLE ORDER DETAILS */
      getOrderById: async (orderId) => {
        set({ loading: true, singleOrder: null });
        try {
          const res = await API.get(`/order/${orderId}`);
          if (res.data.success) {
            set({ singleOrder: res.data.order });
          } else {
            toast.error("Failed to fetch order details");
          }
        } catch (error) {
          handleApiError(error, "Unable to fetch order details");
        } finally {
          set({ loading: false });
        }
      },

      /** 🔄 UPDATE ORDER STATUS */
      updateOrderStatus: async (orderId, status) => {
        const validStatuses: OrderStatus[] = [
          OrderStatus.cancelled,
          OrderStatus.confirmed,
          OrderStatus.delivered,
          OrderStatus.failed,
          OrderStatus.out_for_delivery,
          OrderStatus.pending,
          OrderStatus.preparing,
        ];

        if (!validStatuses.includes(status)) {
          toast.error("Invalid order status");
          return;
        }

        set({ loading: true });
        try {
          const res = await API.put(`/order/${orderId}/status`, { status });
          if (res.data.success) {
            toast.success(res.data.message || `Status updated to ${status}`);

            // Update state locally (optimistic update)
            set((state) => ({
              shopOrders: state.shopOrders.map((o) =>
                o.id === orderId ? { ...o, orderStatus: status } : o
              ),
              orders: state.orders.map((o) =>
                o.id === orderId ? { ...o, orderStatus: status } : o
              ),
              singleOrder:
                state.singleOrder?.id === orderId
                  ? { ...state.singleOrder, orderStatus: status }
                  : state.singleOrder,
            }));
          } else {
            toast.error("Failed to update order");
          }
        } catch (error) {
          handleApiError(error, "Failed to update order status");
        } finally {
          set({ loading: false });
        }
      },

      /** 🧹 CLEAR STORE */
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
