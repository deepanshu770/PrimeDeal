import { Unit } from "@/types/types";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// ---------------------------------------------------------
// 🧾 CART ITEM TYPE
// ---------------------------------------------------------
export interface CartItem {
  id: number; // productId
  productName: string;
  image: string;
  price: number;
  shopId: number;
  shopName?: string;
  quantity: number;
  netQty: number;
  unit: Unit;
  isAvailable?: boolean;
}

// ---------------------------------------------------------
// 🛒 CART STORE STATE
// ---------------------------------------------------------
export interface CartState {
  cartItems: CartItem[];
  addToCart: (product: any) => boolean; // can be from AvailableProducts or ShopDetails
  removeFromCart: (productId: number, shopId: number) => void;
  increMentQuantity: (productId: number, shopId: number) => void;
  decreMentQuantity: (productId: number, shopId: number) => void;
  clearCart: () => void;
  clearShopCart: (shopId: number) => void;
  getShopCart: (shopId: number) => CartItem[];
}

// ---------------------------------------------------------
// 🧠 ZUSTAND STORE
// ---------------------------------------------------------
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],

      /** 🛒 ADD PRODUCT — Works for both AvailableProducts & ShopDetails */
      addToCart: (product: any) => {
        let itemAdded = false;

        // 🧩 Normalize input from either source
        const normalizedItem: CartItem = {
          id:
            product.productId || product.id || product.product?.id || 0, // supports both
          productName:
            product.productName ||
            product.name ||
            product.product?.name ||
            "Unnamed Product",
          image:
            product.image ||
            product.product?.image ||
            "https://placehold.co/300x300?text=No+Image",
          price: product.price || 0,
          shopId: product.shopId || product.shop?.id || 0,
          shopName: product.shopName || product.shop?.storeName || "Shop",
          quantity: 1,
          netQty: Number(product.netQty || product.product?.netQty || 1),
          unit: product.unit || product.product?.unit || "pcs",
          isAvailable:
            product.isAvailable !== undefined
              ? product.isAvailable
              : true,
        };

        // ⚡ Update Zustand state
        set((state) => {
          const existing = state.cartItems.find(
            (item) =>
              item.id === normalizedItem.id &&
              item.shopId === normalizedItem.shopId
          );

          if (existing) {
            // ✅ Increment quantity if already present
            return {
              cartItems: state.cartItems.map((item) =>
                item.id === normalizedItem.id &&
                item.shopId === normalizedItem.shopId
                  ? { ...item, quantity: Math.min(item.quantity + 1, 10) }
                  : item
              ),
            };
          }

          // 🆕 Add new product
          itemAdded = true;
          return { cartItems: [...state.cartItems, normalizedItem] };
        });

        if (itemAdded)
          toast.success(`🛒 Added ${normalizedItem.productName} to cart`);
        return itemAdded;
      },

      /** ❌ REMOVE ITEM */
      removeFromCart: (productId: number, shopId: number) => {
        set((state) => ({
          cartItems: state.cartItems.filter(
            (item) => !(item.id === productId && item.shopId === shopId)
          ),
        }));
      },

      /** ➕ INCREMENT QUANTITY */
      increMentQuantity: (productId: number, shopId: number) => {
        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item.id === productId && item.shopId === shopId
              ? { ...item, quantity: Math.min(item.quantity + 1, 10) }
              : item
          ),
        }));
      },

      /** ➖ DECREMENT QUANTITY */
      decreMentQuantity: (productId: number, shopId: number) => {
        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item.id === productId &&
            item.shopId === shopId &&
            item.quantity > 1
              ? { ...item, quantity: item.quantity - 1 }
              : item
          ),
        }));
      },

      /** 🧹 CLEAR ALL CART ITEMS */
      clearCart: () => {
        localStorage.removeItem("prime-deal-cart");
        set({ cartItems: [] });
      },

      /** 🧹 CLEAR CART ITEMS FOR A SPECIFIC SHOP */
      clearShopCart: (shopId: number) => {
        set((state) => ({
          cartItems: state.cartItems.filter(
            (item) => item.shopId !== shopId
          ),
        }));
      },

      /** 🏪 GET CART ITEMS OF A SPECIFIC SHOP */
      getShopCart: (shopId: number) => {
        return get().cartItems.filter((item) => item.shopId === shopId);
      },
    }),
    {
      name: "prime-deal-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
