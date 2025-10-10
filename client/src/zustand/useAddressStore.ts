import API from "@/config/api";
import { Address } from "@/types/addressType";

import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type AddressStore={
  loading :boolean,
  addresses:Address[],
  getAddress:()=>Promise<void>
}
export const useAddressStore = create<AddressStore>()(
  persist(
    (set) => ({
      loading: false,
      addresses: [],
      getAddress: async () => {
        try {
            const response = await API.get("/address");
            if(response.data.success){
              set({
                loading:false,
                addresses:response.data.addresses
              })
            }else{
              set({
                loading:false,
              })
              
            }
        } catch (error) {
          toast.error(error?.message);
        }
      },
    }),
    {
      name: "order-store",
      // storage:createJSONStorage(()=>localStorage)
    }
  )
);
