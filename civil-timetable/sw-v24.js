const CACHE_NAME='civil-timetable-v24';
const APP_SHELL=['./','./index.html','./app-v23.html','./manifest.webmanifest','./icon.svg','./app-v5.js?v=23','./progress-fix-v6.js?v=23','./align-finish-v10.js?v=23','./written-defaults-v16.js?v=23','./practical-align-v14.js?v=23','./course-loop-v17.js?v=23','./data-tools-goal-v18.js?v=23','./study-summary-v18.js?v=23','./calendar-view-v19.js?v=23','./risk-notify-v20.js?v=23','./theme-v21.js?v=23','./risk-contrast-v22.js?v=23','./auto-backup-v23.js?v=23','./pwa-v23.js?v=23'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

self.addEventListener('message',event=>{
  if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting();
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;

  if(request.mode==='navigate'){
    event.respondWith(fetch(request).then(response=>{
      const copy=response.clone();
      caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));
      return response;
    }).catch(async()=>await caches.match(request)||await caches.match('./app-v23.html')||await caches.match('./index.html')));
    return;
  }

  event.respondWith(caches.match(request).then(cached=>{
    const network=fetch(request).then(response=>{
      if(response&&response.ok){
        const copy=response.clone();
        caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));
      }
      return response;
    }).catch(()=>cached);
    return cached||network;
  }));
});