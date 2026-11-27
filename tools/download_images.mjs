// Descarga las fotos (Wikimedia Commons) y escudos (TheSportsDB) para servirlos desde el propio sitio.
// Escribe public/img/fotos/<id>.jpg, public/img/escudos/<slug>.png y src/data/images-local.json.
// Uso: node tools/download_images.mjs   (lo corre la GitHub Action "Descargar imágenes").
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";

const UA = "futbol-de-primera/1.0 (https://futbol-de1era.vercel.app)";
const photos = JSON.parse(readFileSync("src/data/photos.json", "utf8"));
const crests = JSON.parse(readFileSync("src/data/crests.json", "utf8"));
const OUT = "src/data/images-local.json";
const local = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : { photos: {}, crests: {} };
mkdirSync("public/img/fotos", { recursive: true });
mkdirSync("public/img/escudos", { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slug = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function get(url) {
  for (let i = 0; i < 6; i++) {
    const r = await fetch(url, { headers: { "User-Agent": UA } }).catch(() => null);
    if (r && r.ok) return Buffer.from(await r.arrayBuffer());
    const wait = r?.status === 429 ? (Number(r.headers.get("retry-after")) || 20) * 1000 : 3000;
    console.log(`  reintento ${url.slice(0, 80)} (${r?.status ?? "error de red"})`);
    await sleep(wait);
  }
  return null;
}
const save = () => writeFileSync(OUT, JSON.stringify(local, null, 1) + "\n");

let n = 0;
for (const [id, p] of Object.entries(photos)) {
  if (local.photos[id]) continue;
  // Miniatura de 250 px: probamos el host de miniaturas y, si falla, el de archivos.
  const buf = (await get(p.url)) ?? (await get(p.url.replace("thumb.wikimedia.org", "upload.wikimedia.org")));
  if (buf) { writeFileSync(`public/img/fotos/${id}.jpg`, buf); local.photos[id] = `/img/fotos/${id}.jpg`; n++; if (n % 20 === 0) save(); }
  await sleep(400);
}
save();
console.log("fotos:", Object.keys(local.photos).length);
let m = 0;
for (const [club, url] of Object.entries(crests)) {
  if (local.crests[club]) continue;
  const buf = await get(`${url}/small`);
  if (buf) { const f = `${slug(club)}.png`; writeFileSync(`public/img/escudos/${f}`, buf); local.crests[club] = `/img/escudos/${f}`; m++; if (m % 20 === 0) save(); }
  await sleep(300);
}
save();
console.log("escudos:", Object.keys(local.crests).length);
