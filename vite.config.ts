// vite.config.ts
import path from 'path'; // Ya estás usando path, genial.
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react'; // Necesitarás importar esto si lo usas

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // Necesitarás añadir los plugins aquí, como react()
      // plugins: [react()], // <--- Añade esto si aún no lo tienes

      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});