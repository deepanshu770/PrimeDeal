import { orderItem } from "@/types/orderType";
import { ProductItem, ShopState, } from "@/types/shopTypes";
import axios from "axios";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

axios.defaults.withCredentials = true;

const API_END_POINT = "http://localhost:3000/api/v1/shop";
 

export const useShopStore = create<ShopState>()(persist((set, get) => ({
    loading: false,
    shop: null,
    searchedShop: null,
    singleShop: null,
    shopOrders: [],

    //create shop api implementation
    createShop: async (formData: FormData) => {
        try {
            set({ loading: true });
            const response = await axios.post(`${API_END_POINT}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
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
                set({ loading: false, shop: response.data.shop });

            }
        } catch (error: any) {
            if (error.response.status === 404) {
                set({ shop: null });
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
                    'Content-Type': 'multipart/form-data'
                }
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
    searchShop: async (searchText: string, searchQuery: string, /*selectedProducts: any */) => {
        try {
            set({ loading: true });
            const params = new URLSearchParams();
            params.set("searchQuery", searchQuery);
            //params.set("selectedProducts", selectedProducts);

            const response = await axios.get(`${API_END_POINT}/search/${searchText}?${params.toString()}`);
            if (response.data.success) {
                set({ loading: false, searchedShop: response.data });
            }
        } catch (error) {
            set({ loading: false });
        }
    },

    addProductToShop: (product: ProductItem) => {
        set((state: any) => ({
            shop: state.shop ? {
                ...state.shop, products: [...state.shop.products, product]
            } : null,
        }))
    },

    updateProductInShop: (updatedProduct: ProductItem) => {
        set((state: any) => {
            if (state.shop) {
                updatedProduct = state.shop.products.map((product: any) => product.id === updatedProduct.id ? updatedProduct : product);
                return {
                    shop: {
                        ...state.shop, products: updatedProduct
                    }
                }
            }
            return state;
        })

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
        }
    },
    updateShopOrders: async (orderId: string, orderStatus: string) => {
        try {
            const response = await axios.put(`${API_END_POINT}/order/${orderId}/status`,
                { status: orderStatus },
                { headers: { "Content-Type": "application/json" } }
            );
            if (response.data.success) {
                try {
                    const updatedOrders = get().shopOrders.map((order: orderItem) =>
                        order.id === orderId ? { ...order, status: response.data.status } : order
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
        set({ shop: null, singleShop: null });
    },

}),
    {
        name: "store-name",
        storage: createJSONStorage(() => localStorage),
    })) 