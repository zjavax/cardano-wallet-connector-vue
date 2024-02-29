import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import wasm from 'vite-plugin-wasm'
// import OptimizationPersist from 'vite-plugin-optimize-persist'
// import PkgConfig from 'vite-plugin-package-config'

import Unocss from 'unocss/vite'
import {
  presetAttributify,
  presetIcons,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

const pathSrc = path.resolve(__dirname, 'src')

// https://vitejs.dev/config/
export default defineConfig({
  server: { host: '0.0.0.0', port: 4001 },

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
    // PkgConfig(),
    // OptimizationPersist(),
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
    include: [
      'vue',
      'map-factory',
      'element-plus/es',
      'element-plus/es/components/form/style/index',
      'element-plus/es/components/radio-group/style/index',
      'element-plus/es/components/radio/style/index',
      'element-plus/es/components/checkbox/style/index',
      'element-plus/es/components/checkbox-group/style/index',
      'element-plus/es/components/switch/style/index',
      'element-plus/es/components/time-picker/style/index',
      'element-plus/es/components/date-picker/style/index',
      'element-plus/es/components/col/style/index',
      'element-plus/es/components/form-item/style/index',
      'element-plus/es/components/alert/style/index',
      'element-plus/es/components/breadcrumb/style/index',
      'element-plus/es/components/select/style/index',
      'element-plus/es/components/input/style/index',
      'element-plus/es/components/breadcrumb-item/style/index',
      'element-plus/es/components/tag/style/index',
      'element-plus/es/components/pagination/style/index',
      'element-plus/es/components/table/style/index',
      'element-plus/es/components/table-column/style/index',
      'element-plus/es/components/card/style/index',
      'element-plus/es/components/row/style/index',
      'element-plus/es/components/button/style/index',
      'element-plus/es/components/menu/style/index',
      'element-plus/es/components/sub-menu/style/index',
      'element-plus/es/components/menu-item/style/index',
      'element-plus/es/components/option/style/index',
      '@element-plus/icons-vue',
      'pinia',
      'axios',
      'vue-request',
      'vue-router',
      '@vueuse/core',
    ],
  },
  build: {
    target: 'esnext',
  },
})
