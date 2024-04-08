import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ArcoResolver } from 'unplugin-vue-components/resolvers'
import { vitePluginForArco } from '@arco-plugins/vite-vue'
import compression from 'vite-plugin-compression'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    AutoImport({
      resolvers: [ArcoResolver()]
    }),
    Components({
      resolvers: [
        ArcoResolver({
          sideEffect: true
        })
      ]
    }),
    vitePluginForArco({
      style: 'css'
    }),
    compression({
      verbose: true,
      disable: false,
      threshold: 10240,
      // 删除源文件
      deleteOriginFile: true,
      algorithm: 'gzip',
      ext: '.gz'
    })
  ],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'js/[name]-main-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames(assetInfo) {
          if (assetInfo.name?.endsWith('.css')) return (assetInfo.name = 'css/[name]-[hash].css')
          const images = ['png', 'jpg', 'jpeg', 'gif', 'svg']
          if (images.includes(assetInfo.name?.split('.')[1] ?? '')) {
            return 'img/[name]-[hash].[ext]'
          }
          return '[ext]/[name]-[hash].[ext]'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    host: '0.0.0.0'
  }
})
