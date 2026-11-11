import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 前端源码在 client/ 目录，构建产物输出到根目录 dist/
export default defineConfig({
  root: 'client',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // 开发模式下把 /api 请求转发给本地 Express 服务
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
