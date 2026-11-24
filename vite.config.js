import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { theme } from './src/theme.js';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'ghost-relay-theme',
      transformIndexHtml(html) {
        return html
          .replace('__APP_THEME__', theme.name)
          .replace('__APP_THEME_COLOR__', theme.color);
      },
    },
  ],
});
