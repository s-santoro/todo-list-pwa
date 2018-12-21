let cacheName = "todo_v1";
importScripts('./javascript/idb-keyval.js');

/**
 * Initial caching of files for layout.
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
          "./",
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
  /**
   * Offline-fetching and caching
   *
   * not in cache => request and save it in cache
   */
  event.respondWith(caches.match(event.request).then(response => {
    // when user is online, fetch resource
    // otherwise get from cache if exists in cache
    if (response && (!event.request.url.includes("api/tasks") || !navigator.onLine)) {
      return response;
    }
    // fetch request
    let requestClone = event.request.clone();
    return fetch(requestClone).then(res => {
      // if request failed then return immediately
      if (!res || res.status !== 200) {
        return res;
      }
      let resClone = res.clone();
      // cache request only if HTTP-GET was used
      caches.open(cacheName)
        .then(cache => {
          if (requestClone.method === 'GET') {
            cache.put(requestClone, resClone);
          }
        })
      return res;
    }).catch(error => {
      // failed to fetch
      // return with status 200
      return new Response("", { "status": 200, "statusText": "No network-connection" });
    });
  }).catch(error => {
    console.log(error);
  }));
});


// Background Sync to add tasks
self.addEventListener('sync', function (event) {
  if (event.tag === 'tasksPost') {
    event.waitUntil(
      idbKeyval.keys().then(keys => {
        keys.reverse();
        keys.forEach(function (key) {
          idbKeyval.get(key).then(value => {
            if (value.state === "post") {
              fetch('/api/tasks', {
                method: 'POST',
                headers: new Headers({ 'content-type': 'application/json' }),
                body: JSON.stringify(value)
              })
              idbKeyval.delete(key);
            }
          })
        })
      })
    )
  }
});

// Background Sync to close tasks
self.addEventListener('sync', function (event) {
  if (event.tag === 'tasksPut') {
    event.waitUntil(
      idbKeyval.keys().then(keys => {
        keys.reverse();
        keys.forEach(function (key) {
          idbKeyval.get(key).then(value => {
            console.log(value);
            if (value.state === "put") {
              fetch('/api/tasks/' + value.id, {
                method: 'PUT',
                headers: new Headers({ 'content-type': 'application/json' })
              })
              idbKeyval.delete(key);
            }
          })
        })
      })
    )
  }
});