import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const proxy = {
    '/insforge': {
      target: env.VITE_INSFORGE_URL || 'https://4rdisy8j.us-east.insforge.app',
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/insforge/, ''),
    },
  };
  return {
    plugins: [react()],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    server: { proxy },
    preview: { proxy },
  };
});
