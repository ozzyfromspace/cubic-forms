// import path from 'path'
// import { defineConfig } from 'vite'
// import dts from 'vite-plugin-dts'

// export default defineConfig({
//   plugins: [dts()],
//   resolve: {
//     alias: {
//       '@': path.resolve(__dirname, 'src'),
//     },
//   },
//   build: {
//     lib: {
//       entry: path.resolve(__dirname, 'src/index.ts'),
//       name: 'CubicForms',
//       fileName: (format) => `cubicforms.${format}.js`,
//     },
//     rollupOptions: {
//       external: ['vue', 'nuxt', '@vue/runtime-core', 'lodash', 'zod'],
//       output: {
//         globals: {
//           vue: 'Vue',
//           nuxt: 'Nuxt',
//           lodash: '_',
//           zod: 'Zod',
//         },
//       },
//     },
//   },
// })

import vue from '@vitejs/plugin-vue'
import { builtinModules } from 'module'
import path from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [vue(), dts()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '#app': 'nuxt/app',
    },
  },
  build: {
    lib: {
      formats: ['es', 'cjs'],
      entry: path.resolve(__dirname, 'src/module.ts'),
      name: 'CubicFormsModule',
      // fileName: (format) => {
      //   if (format === 'cjs' || format === 'umd') return 'module.cjs.js'
      //   return `module.${format}.js`
      // },
      fileName: (format) => `module.${format}.js`,
    },
    minify: 'terser',
    terserOptions: {
      mangle: false,
      keep_fnames: true, // Preserve function names
    },
    rollupOptions: {
      external: [
        'vue',
        'nuxt',
        'nuxt/app',
        '@vue/runtime-core',
        'lodash',
        'pinia',
        'zod',
        'immer',
        '#app',
        '@vitejs/plugin-vue',
        ...builtinModules, // Externalize built-in modules without 'node:' prefix
        ...builtinModules.map((m) => `node:${m}`), // Externalize built-in modules with 'node:' prefix
        'globby', // Externalize globby
        'unicorn-magic', // Externalize unicorn-magic
        // '#app-manifest',
        // /^#build\//, // Regex to exclude anything matching "#build/*" from nuxt
        // /^#internal\//, // Regex to exclude anything matching "#internal/*" from nuxt,
      ],
      output: {
        globals: {
          nuxt: 'Nuxt',
          '#app': 'NuxtApp',
        },
      },
    },
  },
})
