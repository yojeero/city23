import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  base: './',
  plugins: [
    tailwindcss()
  ],
  root: 'src',
  build: {
    minify: true,
    outDir: '../public',
    assetsDir: '',
    assetsInlineLimit: 0,
    rollupOptions: {
      input: path.join(__dirname, 'src/index.html'),
      output: {
        assetFileNames: ({ name }) => {
          if (name.endsWith('.css')) {
            return `css/style.[ext]`;
          } else if (/\.(png|jpe?g|gif|svg|webp|webm|avif)$/.test(name)) {
            return `images/[name].[ext]`;
          } else if (/\.(woff|woff2|eot|ttf|otf)$/.test(name)) {
            return `fonts/[name].[ext]`;
          } else if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)$/.test(name)) {
            return `media/[name].[ext]`;
          } else {
            return `assets/[name].[ext]`;
          }
        },
      },
      emptyOutDir: true,
    },
  },
});

