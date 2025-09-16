import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import axios from "axios";
import {
  LoginInputState,
  SignupInputState,
  ProfileInputState,
} from "@/schema/userSchema";
import { toast } from "sonner";
import { useCartstore } from "./useCartstore";
import { useShopStore } from "./useShopStore";

const API_END_POINT = "http://localhost:3000/api/v1/user";
axios.defaults.withCredentials = true;

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
  verifyEmail: (verificationCode: string) => Promise<void>;
  checkAuthentication: () => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
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
          const response = await axios.post(`${API_END_POINT}/signup`, input, {
            headers: {
              "Content-Type": "application/json",
            },
          });
          if (response.data.success) {
            toast.success(response.data.message);
          } else {
            set({ loading: false });
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
          const response = await axios.post(`${API_END_POINT}/login`, input, {
            headers: {
              "Content-Type": "application/json",
            },
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

      //verify email api implementation
      verifyEmail: async (verificationCode: string) => {
        try {
          set({ loading: true });
          const response = await axios.post(
            `${API_END_POINT}/verifyemail`,
            { verificationCode },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (response.data.success) {
            toast.success(response.data.message);
            set({
              loading: false,
              user: response.data.user,
              isAuthenticated: true,
            });
          }
        } catch (error: any) {
          toast.error(error.response.data.message);
          set({ loading: false });
        }
      },

      //checkAuthentication api implementation
      checkAuthentication: async () => {
              set({
                // user: response.data.user,
                isAuthenticated: false,
                isCheckingAuth: false,
              });
        // try {
        //   set({ isCheckingAuth: true });
        //   const response = await axios.get(`${API_END_POINT}/checkauth`);
        //   if (response.data.success) {
        //     set({
        //       user: response.data.user,
        //       isAuthenticated: true,
        //       isCheckingAuth: false,
        //     });
        //   }
        // } catch (error) {
        //   set({ isAuthenticated: false, isCheckingAuth: false });
        // }
      },

      //logout api implementation
      logout: async () => {
        try {
          set({ loading: true });
          const response = await axios.post(`${API_END_POINT}/logout`);
          if (response.data.success) {
            toast.success(response.data.message);
            useCartstore.getState().clearCart();
            useShopStore.getState().clearShop();
            set({ loading: false, user: null, isAuthenticated: false });
          }
        } catch (error) {
          set({ loading: false });
        }
      },

      //forgot password api implementation
      forgotPassword: async (email: string) => {
        try {
          set({ loading: true });
          const response = await axios.post(`${API_END_POINT}/forgotpassword`, {
            email,
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

      //reset password api implementation
      resetPassword: async (token: string, newPassword: string) => {
        try {
          set({ loading: true });
          const response = await axios.post(
            `${API_END_POINT}/resetpassword/${token}`,
            { newPassword }
          );
          if (response.data.success) {
            toast.success(response.data.message);
            set({ loading: false });
          }
        } catch (error: any) {
          toast.error(error.response.data.message);
          set({ loading: false });
        }
      },

      //update user profile api implementation
      updateProfile: async (input: ProfileInputState) => {
        try {
          const response = await axios.put(
            `${API_END_POINT}/profile/update`,
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
          const response = await axios.patch(
            `${API_END_POINT}/profile/toggle-admin`,
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
