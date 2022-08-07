import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'plugin/index.ts'),
      name: 'postcss-responsive',
      fileName: format => `${format}.js`,
    },
    rollupOptions: {
      external: ['postcss-value-parser'],
      output: {
        globals: {
          'postcss-value-parser': 'postcss-value-parser',
        },
      },
    },
  },
})
