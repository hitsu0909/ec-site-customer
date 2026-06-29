import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path"; // ✅ 追加

export default defineConfig({
  plugins: [vue()],
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // ✅ これ追加
    },
  },
});
