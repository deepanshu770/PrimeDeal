import axios from "axios";
import { API_END_POINT } from "./varibles";

// Create an Axios instance
const API = axios.create({
  baseURL:API_END_POINT, // change this to your base URL
  timeout: 10000, // timeout in milliseconds (e.g., 10000 = 10 seconds)
  withCredentials:true,


});

// Add a response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = "An unknown error occurred.";

    if (error.code === "ECONNABORTED") {
      message = "Request timed out. Please try again.";
    } else if (error.response) {
      // Server responded with a status outside 2xx
      switch (error.response.status) {
        case 400:
          message = "Bad request. Please check your input.";
          break;
        case 401:
          message = "Unauthorized. Please log in again.";
          break;
        case 403:
          message = "Forbidden. You don’t have permission to access this resource.";
          break;
        case 404:
          message = "Resource not found.";
          break;
        case 500:
          message = "Server error. Please try again later.";
          break;
        default:
          message = `Unexpected error: ${error.response.statusText}`;
      }
    } else if (error.request) {
      // Request was made but no response received
      message = "No response from server. Please check your network.";
    }

    // Log or display the error
    console.error(message);

    // Optionally reject with a structured error
    return Promise.reject({ message, ...error });
  }
);

export default API;
