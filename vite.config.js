// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),  // 🔥 JS入口
      name: 'CalendarPicker',
      fileName: 'index',
      formats: ['es', 'cjs']  // 🔥 ES + CJS
    },
    rollupOptions: {
      external: ['vue'],  // 🔥 只把vue当外部
      output: {
        globals: {
          vue: 'Vue'
        },
        exports: 'named'  // 🔥 明确导出
      }
    }
  },
  plugins: [vue()]
})