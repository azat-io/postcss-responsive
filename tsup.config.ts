import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['plugin/**/*.ts'],
  format: ['cjs', 'esm'],
  sourcemap: true,
  outDir: 'dist',
  bundle: false,
  clean: true,
  dts: true,
})
