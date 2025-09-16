import { CartItem, CartState } from "@/types/CartType";
import { ProductItem } from "@/types/shopTypes";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";


export const useCartstore = create<CartState>()(persist((set) => ({
    cartItems: [],
    addToCart: (product: ProductItem, shopId: string) => {
        let itemAdded = false;
        set((state) => {
            if (state.cartItems.length > 0) {
                const existingShopId = state.cartItems[0].shopId; // ✅ Get the shopId of first item in cart
    
                if (existingShopId !== shopId) {
                    toast.error("Cart has products from a different shop"); // ❌ Show error if different shop
                    return state; // ❌ Do not add product
                }
            }
            
            const existingProduct = state.cartItems.find((cartItem) => cartItem.id === product.id);

            if (existingProduct) {
                return {
                    cartItems: state.cartItems.map((cartItem) => cartItem.id === product.id ? { ...cartItem, quantity: Math.min(cartItem.quantity + 1, 10) } : cartItem)
                };
            }
            else {
                const newProduct: CartItem = {
                    ...product, // ✅ Spread product properties
                    shopId, // ✅ Add shopId (ensures it matches CartItem type)
                    quantity: 1,
                };
                itemAdded = true;
                // ADd new product
                return {
                    cartItems: [...state.cartItems, newProduct]
                }
            }
        });

        return itemAdded;
    },

    clearCart: () => {
        localStorage.removeItem("cart-name"); 
        set({ cartItems: [] });
    },

    removeFromCart: (productId: string) => {
        set((state) => ({
            cartItems: state.cartItems.filter((cartItem) => cartItem.id !== productId)
        })
        )
    },
    increMentQuantity: (productId: string) => {
        set((state) => ({
            cartItems: state.cartItems.map((cartItem) => cartItem.id === productId ? { ...cartItem, quantity: Math.min(cartItem.quantity + 1, 10)} : cartItem)
        }))
    },
    decreMentQuantity: (productId: string) => {
        set((state) => ({
            cartItems: state.cartItems.map((cartItem) => cartItem.id === productId && cartItem.quantity > 1 ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem)
        }))
    },
}),
    {
        name: 'cart-name',
        storage: createJSONStorage(() => localStorage),
    }
))
