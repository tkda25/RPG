const CACHE='astria-pwa-v13';
const CORE=['/RPG/','/RPG/index.html','/RPG/style.css?v=13','/RPG/game.js?v=13','/RPG/hotfix.js?v=13','/RPG/town.js?v=13','/RPG/visual-upgrade.js?v=13','/RPG/living-town.js?v=13','/RPG/eight-direction.js?v=13','/RPG/battle-upgrade.js?v=13','/RPG/manifest.webmanifest?v=13','/RPG/icon.svg?v=13'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;
  event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));return response}).catch(()=>caches.match(event.request).then(r=>r||caches.match('/RPG/'))));
});