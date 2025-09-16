export type CheckoutSessionRequest = {
    cartItems: {
        productId: string;
        name: string;
        image: string;
        price: string;
        quantity: string;
        netQty: string;
    }[];
    deliveryDetails: {
        name: string;
        email: string;
        address: string;
        city: string;
        contact: string;
    };
    shopId: string;
    totalAmount: number;
}

export interface orderItem extends CheckoutSessionRequest {
    id: string;
    status: string;
}

export type OrderState = {
    loading: boolean;
    orders: orderItem[];
    createCheckoutSession: (CheckoutSessionRequest:CheckoutSessionRequest)=>Promise<void>;
    getOrders: () => Promise<void>;

}