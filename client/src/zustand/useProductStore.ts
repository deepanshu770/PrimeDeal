import axios from "axios";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useShopStore } from "./useShopStore";

const API_END_POINT = "http://localhost:3000/api/v1/product";
axios.defaults.withCredentials = true;
 interface Product {
    id: number;
    name: string;
    description: string;
    netQty: string;
    image: string;
    category: string;
    price: number;
    quantity: number;
    isAvailable: boolean;
    createdAt: Date;
}

export interface ShopInventory {
  id: number;
  shopId: number;
  productId: number;
  price: number;
  quantity: number;
  isAvailable: boolean;

  // Optional relations
  shop?: {
    id: number;
    storeName: string;
    city: string;
    address: string;
  };
  product?: Product;
}
// ---------- STORE TYPES ----------
type ProductStoreState = {
  loading: boolean;
  products: Product[]; // global catalog
  shopInventory: ShopInventory[]; // current shop inventory (price, qty, availability)
  createProduct: (formData: FormData, shopId: number) => Promise<void>;
  editProduct: (productId: number, formData: FormData) => Promise<void>;
  fetchProducts: (shopId: number) => Promise<void>;
};

// ---------- STORE IMPLEMENTATION ----------
export const useProductStore = create<ProductStoreState>()(
  persist(
    (set) => ({
      loading: false,
      products: [],
      shopInventory: [],

      // ✅ Fetch all products for a specific shop
      fetchProducts: async (shopId) => {
        try {
          set({ loading: true });
          const response = await axios.get(`${API_END_POINT}/shop/${shopId}`);
          if (response.data.success) {
            set({
              loading: false,
              products: response.data.products,
              shopInventory: response.data.inventory,
            });
          }
        } catch (error: any) {
          set({ loading: false });
          toast.error(error.response?.data?.message || "Failed to fetch products");
        }
      },

      // ✅ Create new product + link it to shop inventory
      createProduct: async (formData, shopId) => {
        try {
          set({ loading: true });
          const response = await axios.post(`${API_END_POINT}/`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            params: { shopId },
          });

          if (response.data.success) {
            const { product, inventory } = response.data;
            toast.success("Product created successfully");

            set((state) => ({
              loading: false,
              products: [...state.products, product],
              shopInventory: [...state.shopInventory, inventory],
            }));

            // update shop store inventory
            useShopStore.getState().addProductToShop(product, inventory);
          }
        } catch (error: any) {
          set({ loading: false });
          toast.error(error.response?.data?.message || "Product creation failed");
        }
      },

      // ✅ Edit product details (for global product)
      editProduct: async (productId, formData) => {
        try {
          set({ loading: true });
          const response = await axios.put(`${API_END_POINT}/${productId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          if (response.data.success) {
            const { product } = response.data;
            toast.success("Product updated");

            set((state) => ({
              loading: false,
              products: state.products.map((p) =>
                p.id === product.id ? product : p
              ),
            }));

            // sync with shop store
            useShopStore.getState().updateProductInShop(product);
          }
        } catch (error: any) {
          set({ loading: false });
          toast.error(error.response?.data?.message || "Update failed");
        }
      },

      // ✅ Toggle product availability (ShopInventory.isAvailable)
    //   toggleAvailability: async (shopInventoryId) => {
    //     try {
    //       set({ loading: true });
    //       const response = await axios.patch(`${API_END_POINT}/inventory/${shopInventoryId}`);

    //       if (response.data.success) {
    //         const updatedInventory: ShopInventory = response.data.inventory;
    //         toast.success(response.data.message || "Availability updated");

    //         set((state) => ({
    //           loading: false,
    //           shopInventory: state.shopInventory.map((inv) =>
    //             inv.id === updatedInventory.id ? updatedInventory : inv
    //           ),
    //         }));

    //         useShopStore
    //           .getState()
    //           .updateInventoryInShop(updatedInventory);
    //       }
    //     } catch (error: any) {
    //       set({ loading: false });
    //       toast.error(error.response?.data?.message || "Action failed");
    //     }
    //   },
    }),
    {
      name: "product-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
