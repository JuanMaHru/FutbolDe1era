// Empaqueta la app en un único HTML (sin servidor) para probarla en cualquier lado.
// Uso: node standalone/build.mjs  ->  standalone/dist/futbol-de-primera.html
import { build } from "esbuild";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const REACT = "18.3.1";

const globals = {
  name: "globals",
  setup(b) {
    b.onResolve({ filter: /^react(-dom)?(\/client)?$/ }, (a) => ({ path: a.path, namespace: "g" }));
    b.onLoad({ filter: /.*/, namespace: "g" }, (a) => ({
      contents: `module.exports = window.${a.path.startsWith("react-dom") ? "ReactDOM" : "React"};`,
      loader: "js",
    }));
  },
};

const out = await build({
  entryPoints: [resolve(here, "entry.tsx")],
  bundle: true,
  write: false,
  minify: process.env.NOMIN ? false : true,
  format: "iife",
  target: "es2020",
  jsx: "transform",
  inject: [resolve(here, "shims/react-global.ts")],
  alias: {
    "next/link": resolve(here, "shims/next-link.tsx"),
    "next/navigation": resolve(here, "shims/next-navigation.ts"),
    "@": resolve(root, "src"),
  },
  define: { "process.env.NEXT_PUBLIC_STANDALONE": '"1"' },
  plugins: [globals],
  logLevel: "warning",
  logOverride: { "unsupported-directive": "silent" },
});

const js = out.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
const css = readFileSync(resolve(root, "src/app/globals.css"), "utf8") +
  `\n.header{top:env(safe-area-inset-top,0px)}\nbody::before{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);z-index:30;background:var(--bg)}\n.container{padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}\n`;

const html = `<title>Fútbol de Primera</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="Adiviná el jugador y el DT del día y competí con tus amigos.">
<style>${css}</style>
<div id="root"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/${REACT}/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/${REACT}/umd/react-dom.production.min.js"></script>
<script>${js}</script>
`;
mkdirSync(resolve(here, "dist"), { recursive: true });
writeFileSync(resolve(here, "dist/futbol-de-primera.html"), html);
console.log(`OK standalone/dist/futbol-de-primera.html (${(html.length / 1024).toFixed(0)} KB)`);
