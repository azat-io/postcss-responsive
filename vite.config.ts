import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        globals: {
          'postcss-value-parser': 'postcss-value-parser',
        },
      },
      external: ['postcss-value-parser'],
    },
    lib: {
      entry: path.resolve(__dirname, 'plugin/index.ts'),
      fileName: format => `${format}.js`,
      name: 'postcss-responsive',
    },
  },
})
