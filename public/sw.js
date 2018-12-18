let cacheName = "todo_v1";

// TODO: listen for beforeinstallprompt and prompt it to user

/**
 * ------- SERVICEWORKER MUSS IN PUBLIC-PFAD SEIN, SONST KANN ER NICHT ÜBER ALLE DATEIEN ARBEITEN
 */
self.addEventListener("install", event => {
  console.log("installing");
  event.waitUntil(
    caches
      .open(cacheName)
      .then(cache => {
        return cache.addAll([
          "./manifest.json",
          "./javascript/script.js",
          "./stylesheets/style.css",
          "./images/favicon.ico",
          "./images/icon_192.png",
          "./images/icon_512.png",
          "./index.html",
          "https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css",
          "https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js",
          "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js",
          "https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js"
        ]);
      })
      .catch(error => console.log("Error while installing", error))
  );
  console.log("installed");
});

/**
 * Intercepting network-request to check cache before fetching.
 */
self.addEventListener("fetch", event => {
  console.log("fetching");
  event.respondWith(
    caches
      .match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        // not in cache => request and save it in cache
        let requestClone = event.request;
        fetch(requestClone)
        .then(res => {
          if (!res || res.status !== 200) {
            return res;
          }
          let resClone = res.clone();
          caches.open(cacheName)
          .then(cache => {
            if(requestClone.method == 'GET'){ 
              cache.put(requestClone, resClone);
            }
          })
          .catch(error => {
            console.log(error);
          });
          return res;
        })
        .catch(error => {
          console.log(error);
        });
      })
      .catch(error => {
        console.log("Failed to fetch: ", error);
      })
  );
});
