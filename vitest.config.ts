import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: [],
    globals: true,
    include: ['**/*.test.{js,jsx,ts,tsx}'],
    exclude: ['node_modules', 'dist', '.next', '**/ProductClient.test.js'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
