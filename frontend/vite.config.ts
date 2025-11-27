import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 匹配所有 /api 开头的请求，转发到后端
      "/api": {
        target: "http://localhost:8080", // 后端地址
        changeOrigin: true, // 允许跨域
        rewrite: (path) => path, // 不需要重写路径（因为后端路由也有 /api）
      },
    },
  },
});
