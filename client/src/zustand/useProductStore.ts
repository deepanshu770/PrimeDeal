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
  description?: string;
  netQty: string;
  image: string;
  category?: string;
  price?: number;
  quantity?: number;
  isAvailable?: boolean;
  createdAt: Date;
}

export interface ShopInventory {
  id: number;
  shopId: number;
  productId: number;
  price: number;
  quantity: number;
  isAvailable: boolean;
  product?: Product;
  shop?: {
    id: number;
    storeName: string;
    city: string;
    address: string;
  };
}

// ---------- STATE INTERFACE ----------
interface ProductStoreState {
  loading: boolean;
  products: Product[]; // Global product catalog
  shopInventory: ShopInventory[]; // Current shop inventory

  fetchAllProducts: (search?: string, categoryId?: number) => Promise<void>;
  fetchShopInventory: (shopId: number) => Promise<void>;
  createProduct: (formData: FormData, shopId: number) => Promise<void>;
  editProduct: (productId: number, formData: FormData) => Promise<void>;
  clearProducts: () => void;
}

// ---------- ERROR HANDLER ----------
const handleError = (error: any, fallbackMsg: string) => {
  const message =
    error?.response?.data?.message || error?.message || fallbackMsg;
  toast.error(message);
  console.error("❌ ProductStore Error:", message);
};

// ---------- STORE IMPLEMENTATION ----------
export const useProductStore = create<ProductStoreState>()(
  persist(
    (set) => ({
      loading: false,
      products: [],
      shopInventory: [],

      /** 🧾 Fetch global product catalog */
      fetchAllProducts: async (search,categoryId) => {
  set({ loading: true });

  try {
    const params: Record<string, string | number> = { };
    if (search) params.search = search;
    if (categoryId) params.categoryId = categoryId;

    const res = await axios.get(`${API_BASE}/catalog`, { params });

    if (res.data.success) {
      set({
        products: res.data.products || [],
        loading: false,
      });
    } else {
      toast.error("⚠️ Failed to load product catalog");
      set({ loading: false });
    }
  } catch (error) {
    set({ loading: false });
    handleError(error, "Error fetching products");
  }
},

      /** 🏪 Fetch inventory for a specific shop */
      fetchShopInventory: async (shopId) => {
        set({ loading: true });
        try {
          const res = await axios.get(`${API_BASE}/shop/${shopId}`);
          if (res.data.success) {
            set({
              loading: false,
              shopInventory: res.data.inventory ?? [],
              products: res.data.products ?? [],
            });
          }
        } catch (error) {
          set({ loading: false });
          handleError(error, "Failed to load shop inventory");
        }
      },

      /** ➕ Create new product and link to shop inventory */
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

            // ✅ Sync with shop store (inventory contains product)
            const shopStore = useShopStore.getState();
            if (inventory) shopStore?.addProductToShop?.(inventory);
          }
        } catch (error) {
          set({ loading: false });
          handleError(error, "Product creation failed");
        }
      },

      /** ✏️ Edit product details */
      editProduct: async (productId, formData) => {
        set({ loading: true });
        try {
          const res = await axios.put(`${API_BASE}/${productId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          if (res.data.success) {
            const { product } = res.data;
            toast.success("Product updated successfully");

            set((state) => ({
              loading: false,
              products: state.products.map((p) =>
                p.id === product.id ? product : p
              ),
            }));

            const shopStore = useShopStore.getState();
            shopStore?.updateProductInShop?.(product);
          }
        } catch (error) {
          set({ loading: false });
          handleError(error, "Product update failed");
        }
      },

      /** 🧹 Clear product cache */
      clearProducts: () => set({ products: [], shopInventory: [] }),
    }),
    {
      name: "prime-deal-product-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
