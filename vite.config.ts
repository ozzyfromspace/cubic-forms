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

import path from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      formats: ['es', 'cjs'],
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'CubicForms',
      fileName: (format) => {
        if (format === 'cjs' || format === 'umd') return 'cubicforms.cjs.js'
        return `cubicforms.${format}.js`
      },
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
        // '#app-manifest',
        // /^#build\//, // Regex to exclude anything matching "#build/*" from nuxt
        // /^#internal\//, // Regex to exclude anything matching "#internal/*" from nuxt,
      ],
    },
  },
})
