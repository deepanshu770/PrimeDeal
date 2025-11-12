import API from "@/config/api";
import { orderItem } from "@/types/orderType";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { NearbyShop, Shop, ShopInventory } from "../../../types/types";

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

// 🧩 Zustand Store
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
        set({ loading: true });
        try {
          const { data } = await API.post(`/shop`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          if (data.success) {
            set((s) => ({ shop: [...s.shop, data.shop] }));
            toast.success("✅ Shop created successfully");
          } else {
            toast.error(data.message || "Failed to create shop");
          }
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Error creating shop");
        } finally {
          set({ loading: false });
        }
      },

      /** ---------------- 🏪 GET ALL SHOPS ---------------- */
      getShop: async () => {
        set({ loading: true });
        try {
          const { data } = await API.get(`/shop`);
          if (data.success) {
            set({ shop: data.shops });
          } else {
            toast.error("Failed to load shops");
          }
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Error fetching shops");
        } finally {
          set({ loading: false });
        }
      },

      /** ---------------- ✏️ UPDATE SHOP ---------------- */
      updateShop: async (formData, existingBanner) => {
        set({ loading: true });
        try {
          if (!formData.has("storeBanner") && existingBanner) {
            formData.append("storeBanner", existingBanner);
          }

          const { data } = await API.put(`/shop`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          if (data.success) {
            set((s) => ({
              shop: s.shop.map((sh) =>
                sh.id === data.shop.id ? data.shop : sh
              ),
            }));
            toast.success("✅ Shop updated successfully");
          } else {
            toast.error("Failed to update shop");
          }
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Error updating shop");
        } finally {
          set({ loading: false });
        }
      },

      /** ---------------- 🔍 SEARCH PRODUCTS ---------------- */
      searchShop: async (query) => {
        set({ loading: true });
        try {
          const { data } = await API.get(
            `/product/search?q=${encodeURIComponent(query)}`
          );
          if (data.success) {
            set({
              searchedProduct: data.products,
              searchedShop: data.shops || [],
            });
          } else {
            set({ searchedProduct: [], searchedShop: [] });
          }
        } catch (err: any) {
          toast.error("Error searching products");
        } finally {
          set({ loading: false });
        }
      },

      /** ---------------- 🧭 GET NEARBY SHOPS ---------------- */
      getNearbyShops: async (radiusKm = 7) => {
        set({ loading: true });
        try {
          const { data } = await API.get(`/shop/nearby?radius=${radiusKm}`);
          if (data.success) {
            set({ nearbyShops: data.shops });
          } else {
            set({ nearbyShops: [] });
          }
        } catch (err: any) {
          toast.error("Failed to fetch nearby shops");
        } finally {
          set({ loading: false });
        }
      },

      /** ---------------- 🏪 GET SINGLE SHOP ---------------- */
      getSingleShop: async (shopId) => {
        set({ loading: true });
        try {
          const { data } = await API.get(`/shop/${shopId}`);
          if (data.success) {
            set({ singleShop: data.shop });
          } else {
            toast.error("Shop not found");
          }
        } catch (err: any) {
          toast.error("Error fetching shop details");
        } finally {
          set({ loading: false });
        }
      },

      /** ---------------- 🧾 GET SHOP ORDERS ---------------- */
      getShopOrders: async () => {
        set({ loading: true });
        try {
          const { data } = await API.get(`/shop/order`);
          if (data.success) {
            set({ shopOrders: data.shopOrder });
          }
        } catch (err: any) {
          toast.error("Failed to fetch shop orders");
        } finally {
          set({ loading: false });
        }
      },

      /** ---------------- 🔄 UPDATE ORDER STATUS ---------------- */
      updateShopOrders: async (orderId, orderStatus) => {
        set({ loading: true });
        try {
          const { data } = await API.put(
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
            toast.success("✅ Order status updated");
          } else {
            toast.error("Failed to update order status");
          }
        } catch (err: any) {
          toast.error("Error updating order status");
        } finally {
          set({ loading: false });
        }
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
