import { orderItem } from "@/types/orderType";
import { Shop, ShopInventory } from "@/types/types";
import axios from "axios";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

axios.defaults.withCredentials = true;

const API_END_POINT = "http://localhost:3000/api/v1/shop";
export type ShopState = {
    loading: boolean;
    shop: Shop[];
    searchedShop:  Shop[] ;
    searchedProduct:  ShopInventory[];
    singleShop: Shop | null;
    shopOrders : orderItem[];
    
    createShop: (formData: FormData) => Promise<void>;
    getShop: () => Promise<void>;
    updateShop: (formData: FormData, existingBanner?: string) => Promise<void>;
    searchShop: (searchText: string, searchQuery: string, /*selectedProducts: any */) => Promise<void>;
    addProductToShop: (product: ShopInventory) => void;
    updateProductInShop: (updatedProduct: ShopInventory) => void;
    getSingleShop: (shopId:string) => Promise<void>;
    getShopOrders : () => Promise<void>;
    updateShopOrders: (orderId:string,orderStatus:string) => Promise<void>;
    clearShop: () => void;
}
export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      loading: false,
      shop: [],
      products: null,
      searchedShop: [],
      searchedProduct: [],
      singleShop: null,
      shopOrders: [],

      //create shop api implementation
      createShop: async (formData: FormData) => {
        try {
          set({ loading: true });
          const response = await axios.post(`${API_END_POINT}`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          if (response.data.success) {
            toast.success(response.data.message);
            set({ loading: false });
          }
        } catch (error: any) {
          toast.error(error.response.data.message);
          set({ loading: false });
        }
      },
      //get shop api implementation
      getShop: async () => {
        try {
          set({ loading: true });
          const response = await axios.get(`${API_END_POINT}`);
          if (response.data.success) {
            set({ loading: false, shop: response.data.shops });
          }
        } catch (error: any) {
          if (error.response.status === 404) {
            set({ shop: [] });
          }
          set({ loading: false });
        }
      },

      //update shop api implementation
      updateShop: async (formData: FormData, existingBanner?: string) => {
        try {
          set({ loading: true });

          if (!formData.has("storeBanner") && existingBanner) {
            formData.append("storeBanner", existingBanner);
          }
          const response = await axios.put(`${API_END_POINT}/`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          if (response.data.success) {
            toast.success(response.data.message);
            set({ loading: false });
          }
        } catch (error: any) {
          toast.error(error.response.data.message);
          set({ loading: false });
        }
      },

      //search shop api implementation
      searchShop: async (
        searchText: string,
        searchQuery: string /*selectedProducts: any */
      ) => {
        try {
          set({ loading: true });
          const params = new URLSearchParams();
          params.set("searchQuery", searchQuery);
          // params.set("selectedProducts", selectedProducts);

          const response = await axios.get(
            `${API_END_POINT}/search/${searchText}?${params.toString()}`
          );

          if (response.data.success) {
            set({
              loading: false,
              searchedShop: response.data.shops,
              searchedProduct: response.data.products,
            });
          }
        } catch (error) {
          set({ loading: false });
        }
      },

      addProductToShop: (product: ShopInventory) => {
        set((state) => {
          const newShop = state.shop.map((shop) => {
            if (shop.id == product.id)
              return { ...shop, products: [...shop.products, product] };
            return shop;
          });
          return { shop: [...state.shop,newShop] };
        });
      },

      updateProductInShop: (updatedProduct: ProductItem) => {
        set((state) => {
          const newShop = state.shop.map((shop) => {
            if (shop.id == updatedProduct.id) {
              const newProducts = shop.products.map((product) => {
                if (product.id === updatedProduct.id) {
                  return updatedProduct;
                }
                return product;
              });
              return { ...shop, products: newProducts };
            }
            return shop;
          });
          return { shop: [...state.shop,newShop] };
        });
      },

      getSingleShop: async (shopId: string) => {
        try {
          set({ loading: true });
          const response = await axios.get(`${API_END_POINT}/${shopId}`);
          if (response.data.success) {
            set({ loading: false, singleShop: response.data.shop });
          }
        } catch (error) {
          set({ loading: false });
        }
      },

      getShopOrders: async () => {
        try {
          set({ loading: true });
          const response = await axios.get(`${API_END_POINT}/order`);
          if (response.data.success) {
            set({ loading: false, shopOrders: response.data.shopOrder });
          }
        } catch (error) {
          console.log(error);
        } finally {
          set({ loading: false });
        }
      },
      updateShopOrders: async (orderId: string, orderStatus: string) => {
        try {
          const response = await axios.put(
            `${API_END_POINT}/order/${orderId}/status`,
            { status: orderStatus },
            { headers: { "Content-Type": "application/json" } }
          );
          if (response.data.success) {
            try {
              const updatedOrders = get().shopOrders.map((order: orderItem) =>
                order.id === orderId
                  ? { ...order, status: response.data.status }
                  : order
              );

              set({ shopOrders: updatedOrders });
            } catch (error) {
              console.error(" Zustand state update failed:", error);
            }
            setTimeout(() => {
              toast.success(response.data.message);
            }, 100);
          }
        } catch (error: any) {
          console.error("❌ API CALL FAILED:", error);
          toast.error(error.response?.data?.message || "Something went wrong");
        }
      },

      clearShop: () => {
        localStorage.removeItem("cart-name");
        set({ shop: [], singleShop: null });
      },
    }),
    {
      name: "store-name",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
