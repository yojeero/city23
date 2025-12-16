<img src="preview/laptop_city23.jpg" width="830" >

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?https://github.com/yojeero/city23)

### [city23 FM](https://city23fm.vercel.app/) - Radio app

- Vercel deploy ready
- PWA app
- 100% Responsive Design
- Tailwind CSS v4
- HTML5, CSS3
- Inline SVG icons 
- Local Google Fonts

#### Build and deploy

- used Tailwind v4 + Vite + pnpm
- in src folder open terminal or   
- in VSCode add folder 'src' in project and open terminal in VSCode   
- run in terminal   

``` 
    - pnpm install 
    - will be installing dependencies from `package.json` file

        dependencies:
        + @tailwindcss/vite 4.1.18
        + tailwindcss 4.1.18

        devDependencies:
        + vite 7.2.7
        + vite-plugin-pwa 1.2.0
        + vite-plugin-static-copy 3.1.4

    - if you need - change file - vite.config.js
    - pnpm run dev
``` 

If will be error:   
```
- remove folder node_modules
- pnpm install
- pnpm install tailwindcss @tailwindcss/vite
- pnpm install vite-plugin-static-copy --save-dev   
- pnpm install vite-plugin-pwa -D
- pnpm run dev   
```

Now in terminal will be link for open project in Live Server   

... Like this ➜ Local: http://localhost:5173/   
... Hold down the left CTRL + click on Link (http://localhost:5173/ or any other)

After making changes in PWA - save and run

```
        - npx vite build or pnpm run build  
        - after that all files will be in the public folder and ready for production
```

PS:   

... Do not delete @import "tailwindcss" in `input.css` in `src/css/` folder.  
... Do not delete - import `../css/style` in `main.js` in `src/js/` folder.   
... manifest.json will be in one level with index.html

#### project structure   

project/   
├─ manifest.json   
├─ service-worker.js     ← custom SW (injectManifest)   
├─ src/   
│  ├─ index.html   
│  ├─ js/      
│  ├─ fonts/   
│  ├─ css/   
│  └─ images/   
├─ vite.config.js   

Have fun!