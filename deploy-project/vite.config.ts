import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import wasm from "vite-plugin-wasm";
import { TanStackRouterVite } from '@tanstack/router-plugin/vite' // 追加！

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    wasm(),
    TanStackRouterVite()
  ],
  build: {
    target: 'esnext',
  },
  optimizeDeps: {
    force: true,
    exclude: ["@wasm"]
  }
})
