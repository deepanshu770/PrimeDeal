import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useShopStore } from "./useShopStore";
import { Product } from "../../../types/types";
import API from "@/config/api";

export interface ShopInventory {
  id: number;
  shopId: number;
  productId: number;
  price: number;
  quantity: number;
  isAvailable: boolean;
  netQty?: number;
  unit?: string;
  // flattened fields when coming from /product/shop/:shopId
  name?: string;
  image?: string;
  product?: Product;
  shop?: {
    id: number;
    storeName: string;
    city: string;
    address: string;
  };
}

type ProductStoreState = {
  loading: boolean;
  products: Product[];
  shopInventory: ShopInventory[];

  fetchAllProducts: (search?: string, categoryId?: number) => Promise<void>;
  fetchProductsByShop: (shopId: number) => Promise<void>;

  createCatalogProduct: (formData: FormData) => Promise<void>;
  editProduct: (productId: number, formData: FormData) => Promise<void>;

  addExistingProductToShop: (
    productId: number,
    shopId: number,
    price: number,
    quantity: number,
    netQtyValue: number,
    unit: string
  ) => Promise<void>;

  updateShopInventory: (
    shopId: number,
    productId: number,
    data: {
      price?: number;
      quantity?: number;
      netQtyValue?: number;
      unit?: string;
      isAvailable?: boolean;
    }
  ) => Promise<void>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleError = (error: any, fallback: string) => {
  console.error("❌ Product Store Error:", error);
  const message = error?.response?.data?.message || error.message || fallback;
  toast.error(message);
};

export const useProductStore = create<ProductStoreState>()(
  persist(
    (set) => ({
      loading: false,
      products: [],
      shopInventory: [],

      // 📌 Fetch all global products
      fetchAllProducts: async (search?: string, categoryId?: number) => {
        set({ loading: true });
        try {
          const params: Record<string, string | number> = {};
          if (search) params.search = search.trim();
          if (categoryId) params.categoryId = categoryId;

          const res = await API.get(`/product/catalog`, { params });

          if (res.data.success) {
            set({
              products: res.data.products || [],
              loading: false,
            });
          }
        } catch (error) {
          set({ loading: false });
          handleError(error, "Error fetching products");
        }
      },

      // 📌 Fetch products for a specific shop
      fetchProductsByShop: async (shopId) => {
        set({ loading: true });
        try {
          const res = await API.get(`/product/shop/${shopId}`);
          if (res.data.success) {
            set({
              shopInventory: res.data.products,
              loading: false,
            });
          }
        } catch (error) {
          set({ loading: false });
          handleError(error, "Error fetching shop products");
        }
      },

      // 📌 Create a new global catalog product
      createCatalogProduct: async (formData: FormData) => {
        set({ loading: true });

        try {
          const res = await API.post(`/product`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          if (res.data.success) {
            const { product } = res.data;

            toast.success("✅ Product created!");
            set((state) => ({
              loading: false,
              products: [...state.products, product],
            }));
          }
        } catch (error) {
          set({ loading: false });
          handleError(error, "Failed to create product");
        }
      },

      // 📌 Edit existing catalog product & its inventory
      editProduct: async (productId: number, formData: FormData) => {
        set({ loading: true });
        try {
          const res = await API.put(`/product/${productId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          if (res.data.success) {
            const { product } = res.data;
            toast.success("✅ Product updated!");
            set((state) => ({
              loading: false,
              products: state.products.map((p) =>
                p.id === product.id ? product : p
              ),
            }));
          }
        } catch (error) {
          set({ loading: false });
          handleError(error, "Failed to update product");
        }
      },

      // 📌 Add an existing catalog product to a shop
      addExistingProductToShop: async (
        productId,
        shopId,
        price,
        quantity,
        netQtyValue,
        unit
      ) => {
        set({ loading: true });

        try {
          const res = await API.post(`/product/add-to-shop`, {
            productId,
            shopId,
            price,
            quantity,
            netQtyValue,
            unit,
          });

          if (res.data.success) {
            const { inventory } = res.data;

            toast.success("Added to shop!");

            set((state) => ({
              loading: false,
              shopInventory: [...state.shopInventory, inventory],
            }));

            const shopStore = useShopStore.getState();
            shopStore?.addProductToShop?.(inventory);
          }
        } catch (error) {
          set({ loading: false });
          handleError(error, "Error adding product to shop");
        }
      },

      // 📌 Update ONLY Shop Inventory (NOT global product)
      updateShopInventory: async (
        shopId,
        productId,
        data
      ) => {
        set({ loading: true });

        try {
          const res = await API.put(
            `/product/shop/${shopId}/product/${productId}`,
            data
          );

          if (res.data.success) {
            const { inventory } = res.data;

            toast.success("Inventory updated!");

            set((state) => ({
              loading: false,
              shopInventory: state.shopInventory.map((item) =>
                item.productId === inventory.id ? inventory : item
              ),
            }));
          }
        } catch (error) {
          set({ loading: false });
          handleError(error, "Error updating shop inventory");
        }
      },
    }),
    {
      name: "product-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
