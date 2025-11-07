import { orderItem } from "@/types/orderType";
import { Shop, ShopInventory, NearbyShop } from "@/types/types";
import axios from "axios";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

axios.defaults.withCredentials = true;

const SHOP_API = "http://localhost:3000/api/v1/shop";
const PRODUCT_API = "http://localhost:3000/api/v1/product";

// 🧩 Centralized API helper (for DRY code)
const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  withCredentials: true,
  timeout: 8000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message || "Network error. Please try again.";
    toast.error(message);
    return Promise.reject(err);
  }
);

// 🧠 Types
export type ShopState = {
  loading: boolean;
  shop: Shop[];
  nearbyShops: NearbyShop[];
  searchedShop: Shop[];
  searchedProduct: ShopInventory[];
  singleShop: Shop | null;
  shopOrders: orderItem[];

  // --- Actions ---
  createShop: (formData: FormData) => Promise<void>;
  getShop: () => Promise<void>;
  updateShop: (formData: FormData, existingBanner?: string) => Promise<void>;
  searchShop: (query: string) => Promise<void>;
  getSingleShop: (shopId: string) => Promise<void>;
  getShopOrders: () => Promise<void>;
  updateShopOrders: (orderId: string, orderStatus: string) => Promise<void>;
  getNearbyShops: (radiusKm?: number) => Promise<void>;
  addProductToShop: (product: ShopInventory) => void;
  updateProductInShop: (updatedProduct: ShopInventory) => void;
  clearShop: () => void;
};

// 🧰 Helper: Set loading with toast feedback
const withLoading = async <T>(
  set: any,
  fn: () => Promise<T>,
  options?: { startMsg?: string; successMsg?: string; errorMsg?: string }
) => {
  try {
    set({ loading: true });
    if (options?.startMsg) toast.info(options.startMsg);
    const result = await fn();
    if (options?.successMsg) toast.success(options.successMsg);
    return result;
  } catch (error: any) {
    toast.error(options?.errorMsg || error.response?.data?.message || "Error occurred");
    throw error;
  } finally {
    set({ loading: false });
  }
};

// 🏬 Zustand Store
export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      loading: false,
      shop: [],
      nearbyShops: [],
      searchedShop: [],
      searchedProduct: [],
      singleShop: null,
      shopOrders: [],

      /** ---------------- 🏬 CREATE SHOP ---------------- */
      createShop: async (formData) => {
        await withLoading(set, async () => {
          const { data } = await api.post(`/shop`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          set((s: ShopState) => ({ shop: [...s.shop, data.shop] }));
        }, { successMsg: "Shop created successfully" });
      },

      /** ---------------- 🏪 GET ALL SHOPS ---------------- */
      getShop: async () => {
        await withLoading(set, async () => {
          const { data } = await api.get(`/shop`);
          if (data.success) set({ shop: data.shops });
        }, { errorMsg: "Failed to load shops" });
      },

      /** ---------------- ✏️ UPDATE SHOP ---------------- */
      updateShop: async (formData, existingBanner) => {
        await withLoading(set, async () => {
          if (!formData.has("storeBanner") && existingBanner)
            formData.append("storeBanner", existingBanner);

          const { data } = await api.put(`/shop`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          set((s: ShopState) => ({
            shop: s.shop.map((sh) =>
              sh.id === data.shop.id ? data.shop : sh
            ),
          }));
        }, { successMsg: "Shop updated successfully" });
      },

      /** ---------------- 🔍 SEARCH PRODUCTS ---------------- */
      searchShop: async (query) => {
        await withLoading(set, async () => {
          const { data } = await api.get(`/product/search?q=${encodeURIComponent(query)}`);
          if (data.success) {
            set({
              searchedProduct: data.products,
              searchedShop: data.shops || [],
            });
          } else {
            set({ searchedProduct: [], searchedShop: [] });
          }
        });
      },

      /** ---------------- 🧭 GET NEARBY SHOPS ---------------- */
      getNearbyShops: async (radiusKm = 7) => {
        await withLoading(set, async () => {
          const { data } = await api.get(`/shop/nearby?radius=${radiusKm}`);
          if (data.success) {
            set({ nearbyShops: data.shops });
          } else {
            set({ nearbyShops: [] });
          }
        }, {
          errorMsg: "Failed to fetch nearby shops",
        });
      },

      /** ---------------- 🏪 GET SINGLE SHOP ---------------- */
      getSingleShop: async (shopId) => {
        await withLoading(set, async () => {
          const { data } = await api.get(`/shop/${shopId}`);
          if (data.success) set({ singleShop: data.shop });
        }, { errorMsg: "Failed to load shop details" });
      },

      /** ---------------- 🧾 GET SHOP ORDERS ---------------- */
      getShopOrders: async () => {
        await withLoading(set, async () => {
          const { data } = await api.get(`/shop/order`);
          if (data.success) set({ shopOrders: data.shopOrder });
        });
      },

      /** ---------------- 🔄 UPDATE ORDER STATUS ---------------- */
      updateShopOrders: async (orderId, orderStatus) => {
        await withLoading(set, async () => {
          const { data } = await api.put(
            `/shop/order/${orderId}/status`,
            { status: orderStatus },
            { headers: { "Content-Type": "application/json" } }
          );
          if (data.success) {
            set({
              shopOrders: get().shopOrders.map((o) =>
                o.id === orderId ? { ...o, status: orderStatus } : o
              ),
            });
          }
        }, { successMsg: "Order status updated" });
      },

      /** ---------------- ➕ ADD PRODUCT TO SHOP ---------------- */
      addProductToShop: (product) => {
        set((state) => ({
          shop: state.shop.map((shop) =>
            shop.id === product.shopId
              ? { ...shop, products: [...(shop.products || []), product] }
              : shop
          ),
        }));
      },

      /** ---------------- ♻️ UPDATE PRODUCT ---------------- */
      updateProductInShop: (updatedProduct) => {
        set((state) => ({
          shop: state.shop.map((shop) =>
            shop.id === updatedProduct.shopId
              ? {
                  ...shop,
                  products: shop.products?.map((p) =>
                    p.id === updatedProduct.id ? updatedProduct : p
                  ),
                }
              : shop
          ),
        }));
      },

      /** ---------------- 🧹 CLEAR ALL ---------------- */
      clearShop: () => {
        localStorage.removeItem("store-name");
        set({
          shop: [],
          nearbyShops: [],
          searchedShop: [],
          searchedProduct: [],
          singleShop: null,
          shopOrders: [],
        });
      },
    }),
    {
      name: "store-name",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        shop: state.shop,
        nearbyShops: state.nearbyShops,
        searchedShop: state.searchedShop,
      }),
    }
  )
);
