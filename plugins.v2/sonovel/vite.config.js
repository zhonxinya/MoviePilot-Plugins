import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: 'SonovelPlugin',
      filename: 'remoteEntry.js',
      exposes: {
        './Page': './src/components/Page.vue',
        './Config': './src/components/Config.vue',
      },
      shared: {
        vue: {
          requiredVersion: false,
          generate: false,
        },
        vuetify: {
          requiredVersion: false,
          generate: false,
          singleton: true,
        },
        'vuetify/styles': {
          requiredVersion: false,
          generate: false,
          singleton: true,
        },
      },
      format: 'esm'
    })
  ],
  build: {
    target: 'esnext',
    minify: false, // 禁用压缩以避免 terser 依赖
    cssCodeSplit: true,
    outDir: './dist',
    assetsDir: 'assets',
    sourcemap: false, // 生产环境禁用 sourcemap
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 将 node_modules 中的依赖单独打包
          // 注意:不要手动拆分 shared 模块(如 vuetify),让 federation 插件自动处理
          if (id.includes('node_modules') && !id.includes('vuetify')) {
            return 'vendor'
          }
        }
      }
    }
  },
  server: {
    port: 5173,
    cors: true
  }
})
