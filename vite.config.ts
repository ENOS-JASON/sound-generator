import { resolve } from 'node:path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [svelte()],
  build: {
    rolldownOptions: {
      input: {
        main: resolve('index.html'),
        benchmark: resolve('src/testing/mock-solver/benchmark.html'),
        audioDiagnostics: resolve('src/audio/synthetic-worklet/diagnostic.html'),
      },
    },
  },
  worker: { format: 'es' },
  base: process.env.VITE_BASE_PATH ?? '/sound-generator/',
});
