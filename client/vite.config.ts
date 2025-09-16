import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173, // 🔹 Force Vite to use port 5173
    strictPort: true, // 🔹 Prevent Vite from switching to another port
  },
})
