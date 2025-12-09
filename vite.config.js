// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import libCss from 'vite-plugin-libcss'

export default defineConfig({
  plugins: [
    vue(),
    libCss()
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),  // 🔥 JS入口
      name: 'CalendarPicker',
      fileName: 'index',
      cssFileName: 'index',
      formats: ['es', 'cjs']  // 🔥 ES + CJS
    },
    rollupOptions: {
      external: ['vue'],  // 🔥 只把vue当外部
      output: {
        globals: {
          vue: 'Vue'
        },
        inlineDynamicImports: false,
        exports: 'named'  // 🔥 明确导出
      }
    },
    cssCodeSplit: true
  }
})