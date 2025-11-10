import API from "@/config/api";
import { Address } from "@/types/addressType";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import axios, { AxiosError } from "axios";

/* ===========================================================
   🧠 Centralized API Error Handler
=========================================================== */
const handleApiError = (error: unknown, defaultMessage = "Something went wrong") => {
  let message = defaultMessage;

  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<any>;
    if (err.response?.data?.message) message = err.response.data.message;
    else if (err.message) message = err.message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  toast.error(message);
  console.error("❌ API Error:", message);
};

/* ===========================================================
   🏠 Address Zustand Store
=========================================================== */
type AddressStore = {
  loading: boolean;
  addresses: Address[];
  selectedAddress: Address | null;

  /** Get all saved addresses of user */
  getAddresses: () => Promise<void>;

  /** Add new address */
  addAddress: (data: Omit<Address, "id">) => Promise<void>;

  /** Delete an address */
  deleteAddress: (id: number) => Promise<void>;

  /** Select an address (for checkout, etc.) */
  setSelectedAddress: (address: Address) => void;

  /** Clear everything */
  clearAddresses: () => void;
};

/* ===========================================================
   🧱 Implementation
=========================================================== */
export const useAddressStore = create<AddressStore>()(
  persist(
    (set, get) => ({
      loading: false,
      addresses: [],
      selectedAddress: null,

      /** 📦 Fetch all user addresses */
      getAddresses: async () => {
        set({ loading: true });
        try {
          const res = await API.get("/address");
          if (res.data.success) {
            set({
              addresses: res.data.addresses || [],
              selectedAddress:
                get().selectedAddress ||
                res.data.addresses.find((a: Address) => a.isDefault) ||
                res.data.addresses[0] ||
                null,
            });
          } else {
            toast.error("Failed to load addresses");
          }
        } catch (error) {
          handleApiError(error, "Unable to fetch addresses");
        } finally {
          set({ loading: false });
        }
      },

      /** ➕ Add new address */
      addAddress: async (data) => {
        set({ loading: true });
        try {
          const res = await API.post("/address", data);
          if (res.data.success) {
            toast.success("Address added successfully");
            set((state) => ({
              addresses: [res.data.address, ...state.addresses],
            }));
          }
        } catch (error) {
          handleApiError(error, "Failed to add address");
        } finally {
          set({ loading: false });
        }
      },

      /** ❌ Delete address */
      deleteAddress: async (id) => {
        set({ loading: true });
        try {
          const res = await API.delete(`/address/${id}`);
          if (res.data.success) {
            toast.success("Address removed");
            set((state) => ({
              addresses: state.addresses.filter((addr) => addr.id !== id),
              selectedAddress:
                state.selectedAddress?.id === id ? null : state.selectedAddress,
            }));
          }
        } catch (error) {
          handleApiError(error, "Failed to delete address");
        } finally {
          set({ loading: false });
        }
      },

      /** 📍 Select address */
      setSelectedAddress: (address) => {
        set({ selectedAddress: address });
        toast.success(`Selected address: ${address.city}`);
      },

      /** 🧹 Clear */
      clearAddresses: () => {
        localStorage.removeItem("prime-deal-addresses");
        set({ addresses: [], selectedAddress: null });
      },
    }),
    {
      name: "prime-deal-addresses",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
