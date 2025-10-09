import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  LoginInputState,
  SignupInputState,
  ProfileInputState,
} from "@/schema/userSchema";
import { toast } from "sonner";
import { useCartstore } from "./useCartstore";
import { useShopStore } from "./useShopStore";
import API from "@/config/api";


type User = {
  fullname: string;
  email: string;
  contact: string;
  address: string;
  city: string;
  profilePicture: string;
  admin: boolean;
  isverified: boolean;
};

type UserState = {
  user: User | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  loading: boolean;

  signup: (input: SignupInputState) => Promise<void>;
  login: (input: LoginInputState) => Promise<void>;
  checkAuthentication: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (input: ProfileInputState) => Promise<void>;
  toggleAdmin: () => Promise<void>;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isCheckingAuth: false,
      loading: false,

      //signUp api implementation
      signup: async (input: SignupInputState) => {
        set({ loading: true });
        try {
          const response = await API.post(`/user/signup`, input, {
            headers: {
              "Content-Type": "application/json",
            },
          });
          if (response.data.success) {
            toast.success(response.data.message);
            set({ loading: false,user:response.data.user,isAuthenticated:true});
          } else {
            set({ loading: false})
          }
        } catch (error: any) {
          console.error("Signup error:", error);
          toast.error(error.response.data.message);
          set({ loading: false });
        }
      },

      //login api implementation
      login: async (input: LoginInputState) => {
        
        try {
          set({ loading: true });
          const response = await API.post(`/user/login`, input, {
            headers: {
              "Content-Type": "application/json",
            },
            timeout:10000,
          });
          if (response.data.success) {
            toast.success(response.data.message);
            set({
              loading: false,
              user: response.data.user,
              isAuthenticated: true,
            });
          } else {
            set({ loading: false });
          }
        } catch (error: any) {
          console.error("Signup error:", error);
          toast.error(error.response.data.message);
          set({ loading: false });
        }
      },

      //checkAuthentication api implementation
      checkAuthentication: async () => {
            
        try {
          set({ isCheckingAuth: true });
          const response = await API.get(`/user/checkauth`);
          if (response.data.success) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isCheckingAuth: false,
            });
          }
        } catch (error) {
          set({ isAuthenticated: false, isCheckingAuth: false });
        }
      },

      //logout api implementation
      logout: async () => {
        try {
          set({ loading: true });
          const response = await API.post(`/user/logout`);
          if (response.data.success) {
            toast.success(response.data.message);
            useCartstore.getState().clearCart();
            useShopStore.getState().clearShop();
          }
          set({ loading: false, user: null, isAuthenticated: false });
        } catch (error) {
          set({ loading: false });
        }
      },

      //update user profile api implementation
      updateProfile: async (input: ProfileInputState) => {
        try {
          const response = await API.put(
            `/user/profile/update`,
            input,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (response.data.success) {
            toast.success(response.data.message);
            set({ user: response.data.user, isAuthenticated: true });
          }
        } catch (error: any) {
          toast.error(error.response.data.message);
        }
      },

      toggleAdmin: async () => {
        try {
          const response = await API.patch(
            `/user/profile/toggle-admin`,
            {},
            {
              headers: { "Content-Type": "application/json" },
            }
          );

          if (response.data.success) {
            toast.success(response.data.message);
            set((state) => ({
              ...state,
              // ✅ Ensure we're spreading the entire state
              user: state.user
                ? { ...state.user, admin: !state.user.admin } // ✅ Ensure user object is fully updated
                : null, // ✅ Handle case where user might be null
            })); // ✅ Toggle admin status in state
          }
        } catch (error: any) {
          toast.error(
            error.response?.data?.message || "Failed to toggle admin status."
          );
          // ✅ Reset loading state on error
        }
      },
    }),
    {
      name: "user-name",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
