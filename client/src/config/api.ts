import axios from "axios";
import { API_END_POINT } from "./varibles";
import { toast } from "sonner";

// Create an Axios instance
const API = axios.create({
  baseURL: API_END_POINT, // change this to your base URL
  timeout: 10000, // timeout in milliseconds (e.g., 10000 = 10 seconds)
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request Interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    toast.error("Request setup failed!");
    return Promise.reject(error);
  }
);


export default API;
