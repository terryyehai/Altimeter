import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 改為相對路徑，讓 GitHub Pages 部署時資源能正確載入
})
