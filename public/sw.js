let cacheName = 'todo_v1';

// TODO: listen for beforeinstallprompt and prompt it to user

/**
 * ------- SERVICEWORKER MUSS IN PUBLIC-PFAD SEIN, SONST KANN ER NICHT ÜBER ALLE DATEIEN ARBEITEN
 */
self.addEventListener('install', (event) => {
  console.log('installing');
  event.waitUntil(
    caches
      .open(cacheName)
      .then((cache) => {
        return cache.addAll([
          './manifest.json',
          './javascript/script.js',
          './stylesheets/style.css',
          './images/favicon.ico',
          './images/icon_192.png',
          './images/icon_512.png',
          './index.html'
        ]);
      })
      .catch((error) => console.log('Error while installing', error))
  );
  console.log('installed');
});

/**
 * Intercepting network-request to check cache before fetching.
 */
self.addEventListener('fetch', (event) => {
  console.log('fetching');
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        // not in cache => request and save it in cache
        let requestClone = event.request;
        fetch(requestClone)
          .then((res) => {
            if (!res || res.status !== 200) {
              return res;
            }
            let resClone = res.clone();
            caches.open(cacheName)
              .then((cache) => {
                cache.put(request, resClone);
              })
              .catch((err) => console.log(err));
              return res;
          });
        })
        .catch((error) => {
          console.log('Failed to fetch: ', error);
        })
  );
});
