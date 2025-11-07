import { CheckoutSessionRequest, OrderState } from "@/types/orderType";
import axios from "axios";
import {create} from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useCartStore } from "./useCartStore";

const API_END_POINT:string = "http://localhost:3000/api/v1/order";
axios.defaults.withCredentials = true;
export const useOrderstore = create<OrderState>()(persist((set)=>({
    loading:false,
    orders:[],
    createCheckoutSession: async(checkoutSession:CheckoutSessionRequest)=>{
        try {
            set({loading:true});
            const response = await axios.post(`${API_END_POINT}/checkout/create-checkout-session`,checkoutSession,{
                headers:{
                    "Content-Type": "application/json"
                }
            });
            set({ orders: [], loading: false }); 
            window.location.href = response.data.checkoutSession.url;
        } catch (error) {
            set({loading:false});
        }
    },
    getOrders: async()=>{
        try {
            set({loading:true});
            const response = await axios.get(`${API_END_POINT}/`);
            set({loading:false,orders:response.data.orders});
            if (response.data.clearCart) {
                useCartStore.getState().clearCart();
            }
        } catch (error) {
            set({loading:false});
        }
    },

}),{
    name:"order-store",
    storage:createJSONStorage(()=>localStorage)
}))