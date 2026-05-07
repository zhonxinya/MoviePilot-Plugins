import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: 'Talebook',
      filename: 'remoteEntry.js',
      exposes: {
        './Page': './src/components/Page.vue',
        './Config': './src/components/Config.vue',
      },
      shared: {
        vue: { requiredVersion: false, generate: false },
        vuetify: { 
          requiredVersion: false, 
          generate: false, 
          // @ts-expect-error - singleton is supported by @originjs/vite-plugin-federation
          singleton: true 
        } as any,
      },
      format: 'esm'
    })
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: true,
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,  // 自动清空输出目录
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
