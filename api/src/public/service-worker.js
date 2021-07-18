const CACHE_NAME = 'v2_cache_talleres_online',
  urlsToCache = []

//durante la fase de instalación, generalmente se almacena en caché los activos estáticos

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache).then(() => self.skipWaiting())
      })
      .catch((err) => console.log('Falló registro de caché: ', err))
  )
})

//una vez que se instala el SW, se activa y busca los recursos para hacer que funcione sin conexión

self.addEventListener('activate', (e) => {
  var cacheWhiteList = [CACHE_NAME]

  e.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        cacheNames.map((cacheName) => {
          //Eliminamos todo lo que haya caducado en el caché

          if (cacheWhiteList.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        })
      })
      // Activa el caché actual

      .then(() => self.clients.claim())
  )
})

//cuando el navegador recupera una url

self.addEventListener('fetch', { redirect: 'follow' }, (e) => {
  // Responder ya con el objeto de la caché o sino, buscar la url real

  e.respondWith(
    caches.match(e.request).then((res) => {
      if (res) {
        // Recuperar caché

        return res
      }
      // Recuperar de la petición de la url

      return fetch(e.request)
    })
  )
})
