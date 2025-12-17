import { defineConfig } from "vite"
import tailwindcss from "@tailwindcss/vite"
import { viteStaticCopy } from "vite-plugin-static-copy"
import path from "path"

export default defineConfig({
  base: "./",
  root: "src",

  plugins: [
    tailwindcss(),
    viteStaticCopy({
      apply: "build",
      targets: [
        { src: "js/pwa-handler.js", dest: "js" },
        { src: "js/main-sw.js", dest: "js" },
        { src: "service-worker.js", dest: "" },
      ],
    }),

    // Clean Vite HTML output
    {
      name: "clean-index-html",
      apply: "build",
      enforce: "post",
      transformIndexHtml(html) {
        return html
          .replace(/<link\s+rel="stylesheet"\s+crossorigin(\s+)?/g, '<link rel="stylesheet" ')
          .replace(/<script\s+src="js\/(main|counter)\.js"\s*><\/script>\s*/g, "")
      },
    },
  ],

  build: {
    minify: true,
    crossOrigin: false,
    outDir: "../public",
    assetsDir: "",
    assetsInlineLimit: 0,
    emptyOutDir: true,

    rollupOptions: {
      input: path.join(__dirname, "src/index.html"),
      output: {
        assetFileNames: ({ name }) => {
          if (!name) return "assets/[hash][extname]"
          if (name.endsWith(".css")) return "css/style.[ext]"
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/.test(name)) return "images/[name].[ext]"
          if (/\.(woff2?|eot|ttf|otf)$/.test(name)) return "fonts/[name].[ext]"
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)$/.test(name)) return "media/[name].[ext]"
          return "assets/[name].[ext]"
        },
      },
    },
  },
})
