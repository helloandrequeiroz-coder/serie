// Série — service worker: app abre offline; imagens dos exercícios ficam em cache depois da 1ª vez.
const VERSION = 'vm-v10';
const SHELL = ['./', './index.html', './library.json', './manifest.webmanifest', './icons/icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION && !k.startsWith('serie-img')).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (u.hostname.endsWith('supabase.co')) return; // dados sempre da rede
  // imagens e libs: cache primeiro
  if (u.pathname.includes('/img/') || u.hostname.includes('jsdelivr') || u.hostname.includes('gstatic') || u.hostname.includes('googleapis')) {
    const name = u.pathname.includes('/img/') ? 'serie-img' : VERSION;
    e.respondWith(caches.open(name).then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok || r.type === 'opaque') c.put(e.request, r.clone()); return r; }))));
    return;
  }
  // app: rede primeiro (pega atualização), cache se offline
  e.respondWith(fetch(e.request, { cache: 'no-store' }).then(r => { if (r.ok && u.origin === location.origin) caches.open(VERSION).then(c => c.put(e.request, r.clone())); return r; }).catch(() => caches.match(e.request).then(h => h || caches.match('./index.html'))));
});
