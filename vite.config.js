import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => {
  const base = command === 'build' ? '/pokedex/' : '/';
  return {
    base: base,
    plugins: [react()],
    resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    allowedHosts: [
      'bf997b56-34a0-4aab-aa22-76e724fac867-00-2ntjnf170236x.pike.replit.dev',
      'localhost',
    ],
  },
  };
});