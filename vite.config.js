import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";
import path from 'path';

// https://vitejs.dev/config/
/* export default defineConfig({
  plugins: [vue()],
})
 */
export default defineConfig({
  server: {
    port: "7060",
    open: true,
  },
  resolve: {
    alias: {
      'src': path.resolve(__dirname, './src'),
      '@': path.resolve(__dirname, './src'),
    }
  },
  plugins: [
    vue({
      template: { 
        transformAssetUrls,
        compilerOptions: {
          comments: false
        }
      },
    }),

    quasar({
      sassVariables: "src/quasar-variables.sass",
    }),
  ],
});