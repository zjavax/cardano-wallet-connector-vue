import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import wasm from 'vite-plugin-wasm'
import OptimizationPersist from 'vite-plugin-optimize-persist'
import PkgConfig from 'vite-plugin-package-config'

import Unocss from 'unocss/vite'
import {
  presetAttributify,
  presetIcons,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import * as dotenv from 'dotenv'

// 打包体积分析 npm i rollup-plugin-visualizer -D
import { visualizer } from 'rollup-plugin-visualizer'

// 打包 CDN 引入 external 排除
import externalGlobals from 'rollup-plugin-external-globals'

const pathSrc = path.resolve(__dirname, 'src')

dotenv.config()

// https://vitejs.dev/config/
export default defineConfig({
  server: { host: process.env.VITE_SERVER_IP, port: 4001 },
  resolve: {
    alias: {
      '~/': `${pathSrc}/`,
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "~/styles/element/index.scss" as *;`,
      },
    },
  },
  plugins: [
    PkgConfig(),
    OptimizationPersist(),
    vue(),
    wasm(),
    Components({
      // allow auto load markdown components under `./src/components/`
      extensions: ['vue', 'md'],
      // allow auto import and register components used in markdown
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      resolvers: [
        ElementPlusResolver({
          importStyle: 'sass',
        }),
      ],
      dts: 'src/components.d.ts',
    }),

    // https://github.com/antfu/unocss
    // see unocss.config.ts for config
    Unocss({
      presets: [
        presetUno(),
        presetAttributify(),
        presetIcons({
          scale: 1.2,
          warn: true,
        }),
      ],
      transformers: [transformerDirectives(), transformerVariantGroup()],
    }),
  ],
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },

  build: {
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1000,
    // 配置打包文件路径和命名
    minify: 'terser',
    outDir: 'tool-plus',
    // 取消计算文件大小，加快打包速度
    reportCompressedSize: false,
    sourcemap: false,
    target: 'esnext',
    terserOptions: {
      compress: {
        // 生产环境时移除console.log调试代码
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      // // 打包时忽略某些包，避免打包时间过长
      external: [
        'vue',
        'vue-router',
        'pinia',
        'vue-demi',
        'ant-design-vue',
        'antd',
        'icons-vue',
        'icons-svg',
        'colors',
        'dayjs',
        'prismjs',
        'sql-formatter',
        // 以下3个包是在使用ant-design-vue的时候始终排除不掉的，感觉ChatGPT协助我解决了这个问题，原来可以使用正则表达式排除
        /^@ant-design\/icons-vue/,
        /^@ant-design\/icons-svg/,
        /^@ant-design\/colors/,
      ],
      plugins: [
        // // 打包时忽略某些包，避免打包时间过长
        externalGlobals({
          vue: 'Vue',
          'vue-router': 'VueRouter',
          pinia: 'Pinia',
          'vue-demi': 'VueDemi',
          'ant-design-vue': 'antd',
          dayjs: 'dayjs',
          prismjs: 'Prism',
          axios: 'axios',
          // qrcode: 'QRCode',
          clipboard: 'ClipboardJS',
          'sql-formatter': 'sqlFormatter',
        }) as any,
      ],
    },
  },
})
