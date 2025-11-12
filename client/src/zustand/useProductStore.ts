import axios from "axios";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useShopStore } from "./useShopStore";

const API_BASE = "http://localhost:3000/api/v1/product";

axios.defaults.withCredentials = true;

// ---------- TYPES ----------
export interface Product {
  id: number;
  name: string;
  description: string;
  netQty: string;
  image: string;
  category?: string;
  price?: number;
  quantity?: number;
  isAvailable?: boolean;
  createdAt?: Date;
}

export interface ShopInventory {
  id: number;
  shopId: number;
  productId: number;
  price: number;
  quantity: number;
  isAvailable: boolean;
  netQty?: number;
  unit?: string;
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

  // Actions
  fetchAllProducts: () => Promise<void>;
  fetchProductsByShop: (shopId: number) => Promise<void>;
  addExistingProductToShop: (
    productId: number,
    shopId: number,
    price: number,
    quantity: number,
    netQtyValue: number,
    unit: string
  ) => Promise<void>;
  createProduct: (formData: FormData, shopId: number) => Promise<void>;
  editProduct: (productId: number, formData: FormData) => Promise<void>;
};

// ---------- HELPER ----------
const handleError = (error: any, fallback: string) => {
  console.error("❌ Product Store Error:", error);
  const message = error?.response?.data?.message || error.message || fallback;
  toast.error(message);
};

// ---------- STORE ----------
export const useProductStore = create<ProductStoreState>()(
  persist(
    (set) => ({
      loading: false,
      products: [],
      shopInventory: [],

      /* -------------------- 🧾 Fetch All Global Products -------------------- */
      fetchAllProducts: async (search?: string, categoryId?: number) => {
        set({ loading: true });
        try {
          const params: Record<string, string | number> = {};
          if (search) params.search = search.trim();
          if (categoryId) params.categoryId = categoryId;

          const res = await axios.get(`${API_BASE}/catalog`, { params });

          if (res.data.success) {
            set({
              products: res.data.products || [],
              loading: false,
            });
          } else {
            toast.error("Failed to load product catalog");
            set({ loading: false });
          }
        } catch (error) {
          set({ loading: false });
          handleError(error, "Error fetching products");
        }
      },

      /* -------------------- 🏪 Fetch All Products in a Shop -------------------- */
      fetchProductsByShop: async (shopId) => {
        set({ loading: true });
        try {
          const res = await axios.get(`${API_BASE}/shop/${shopId}`);
          if (res.data.success) {
            set({
              shopInventory: res.data.products,
              loading: false,
            });
          } else {
            toast.error("Failed to load shop products");
            set({ loading: false });
          }
        } catch (error) {
          set({ loading: false });
          handleError(error, "Error fetching shop products");
        }
      },

      /* -------------------- ➕ Add Existing Product to Shop -------------------- */
      addExistingProductToShop: async (
        productId,
        shopId,
        price,
        quantity = 0,
        netQtyValue,
        unit
      ) => {
        set({ loading: true });

        try {
          const res = await axios.post(`${API_BASE}/add-to-shop`, {
            productId,
            shopId,
            price,
            quantity,
            netQtyValue,
            unit,
          });

          if (res.data.success) {
            const { inventory } = res.data;
            toast.success("✅ Product added to shop successfully!");

            set((state) => ({
              loading: false,
              shopInventory: [...state.shopInventory, inventory],
            }));

            // ✅ Sync with shop store (if available)
            const shopStore = useShopStore.getState();
            shopStore?.addProductToShop?.(inventory);
          } else {
            toast.error(res.data.message || "Failed to add product to shop");
            set({ loading: false });
          }
        } catch (error: any) {
          set({ loading: false });
          handleError(error, "Error adding product to shop");
        }
      },

      /* -------------------- 🆕 Create New Product + Add to Shop -------------------- */
      createProduct: async (formData, shopId) => {
        set({ loading: true });
        try {
          const res = await axios.post(`${API_BASE}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            params: { shopId },
          });

          if (res.data.success) {
            const { product, inventory } = res.data;
            toast.success("✅ Product created successfully!");

            set((state) => ({
              loading: false,
              products: [...state.products, product],
              shopInventory: inventory
                ? [...state.shopInventory, inventory]
                : state.shopInventory,
            }));

            // Sync with shop store
            const shopStore = useShopStore.getState();
            shopStore?.addProductToShop?.(inventory);
          }
        } catch (error) {
          set({ loading: false });
          handleError(error, "Product creation failed");
        }
      },

      /* -------------------- ✏️ Edit Product -------------------- */
      editProduct: async (productId, formData) => {
        set({ loading: true });
        try {
          const res = await axios.put(`${API_BASE}/${productId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          if (res.data.success) {
            const { product } = res.data;
            toast.success("✅ Product updated successfully!");

            set((state) => ({
              loading: false,
              products: state.products.map((p) =>
                p.id === product.id ? product : p
              ),
            }));
          }
        } catch (error) {
          set({ loading: false });
          handleError(error, "Error updating product");
        }
      },
    }),
    {
      name: "product-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
