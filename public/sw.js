// Service worker de Fútbol de Primera: abre rápido y funciona sin conexión.
const VERSION = "fdp-v1";
const SHELL = ["/", "/carrera", "/album", "/ligas", "/perfil", "/icons/icon-192.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL).catch(() => {})).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Archivos estáticos (JS, CSS, imágenes, fuentes): primero el caché.
  const isStatic = url.pathname.startsWith("/_next/static") || url.pathname.startsWith("/img/") || url.pathname.startsWith("/icons/") || url.hostname.includes("fonts.g");
  if (isStatic) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return res; })));
    return;
  }
  // Páginas del sitio: primero la red (datos frescos) y, sin conexión, lo guardado.
  if (url.origin === location.origin && req.mode === "navigate") {
    e.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return res; }).catch(() => caches.match(req).then((hit) => hit || caches.match("/"))));
  }
});
