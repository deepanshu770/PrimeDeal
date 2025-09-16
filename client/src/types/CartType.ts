import { ProductItem } from "./shopTypes";

 export interface CartItem extends ProductItem {
    quantity: number;
    shopId : string;

}

export type CartState = {
    cartItems: CartItem[];
    addToCart: (product: ProductItem , shopId: string) => boolean;
    clearCart: () => void;
    removeFromCart: (productId: string) => void;
    increMentQuantity: (productId: string) => void;
    decreMentQuantity: (productId: string) => void;
}