self.addEventListener('install', event => {
  console.log('V1 installing…');

});


self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
// url são os arquivos baixados
//console.log('Baixando…'+url);
 
 
});

self.addEventListener('activate', (event) => {
  var cacheKeeplist = ['v2'];

  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (cacheKeeplist.indexOf(key) === -1) {
          return caches.delete(key);
        }
      }));
    })
  );
});