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


// The sync event for the contact form
self.addEventListener('sync', function (event) {
  if (event.tag === 'tasksSync') {
    event.waitUntil(
      idbKeyval.keys().then(keys => {
        keys.reverse();
        keys.forEach(function (key) {
          idbKeyval.get(key).then(value =>
            fetch('/api/tasks', {
              method: 'POST',
              headers: new Headers({ 'content-type': 'application/json' }),
              body: JSON.stringify(value)
            })
          )
          idbKeyval.delete(key);
        })
      }
      ))
    /*
    idbKeyval.get('0').then(value =>
      fetch('/api/tasks', {
        method: 'POST',
        headers: new Headers({ 'content-type': 'application/json' }),
        body: JSON.stringify(value)
      })
      
      ));
      */
    // Remove the value from the DB
    //idbKeyval.delete('0');
  }
});


/*
//keeping data synchronized
self.addEventListener('sync', (event) => {

  // IndexedDB is ordered alphabetically
  // Keys are sorted after priority
  // Heighest Priority  A(GET)-B(DELETE)  Lowest Priority
  if (event.tag === 'needsSync') {
    let promise = idbKeyval.keys();
    promise.then((keys) => {
      let posts = [];
      let puts = [];
      let deletes = [];

      for (let k of keys) {
        if (/sendTask/.test(k)) {
          posts.push(k);
        } else if (/updateTask/.test(k)) {
          puts.push(k);
        } else if ((/deleteTask/.test(k))) {
          deletes.push(k);
        }
      }
      let sortedKeys = posts.concat(puts, deletes);

      for (let sortedKey of sortedKeys) {
        if (/sendTask/.test(sortedKey)) {
          idbKeyval.get(sortedKey).then((value) => {
            fetch('api/tasks', {
              method: 'POST',
              headers: new Headers({
                'content-type': 'application/json'
              }),
              body: JSON.stringify(value)
            }).then((response) => {
              console.log("POST sync successful");
            }).catch(err => {
              console.log("POST sync failed");

            });
          });

          idbKeyval.delete(sortedKey);
        } else if (/updateTask/.test(sortedKey)) {
          idbKeyval.get(sortedKey).then((value) => {
            let updatedTask = {
              "description": value.description,
              "category": value.category
            };
            fetch('api/tasks/' + value.id, {
              method: 'PUT',
              headers: {
                'content-type': 'application/json'
              },
              body: JSON.stringify(updatedTask)
            }).then((response) => {
              console.log("PUT sync successful");
            }).catch(err => {
              console.log("PUT sync failed");

            });
          });
          idbKeyval.delete(sortedKey);
        } else if (/deleteTask/.test(sortedKey)) {
          idbKeyval.get(sortedKey).then((value) => {
            fetch('api/tasks/' + value, {
              method: 'DELETE'

            }).then((response) => {
              console.log("DELETE sync successful");

            }).catch(err => {
              console.log("DELETE sync failed");

            });
          });
          idbKeyval.delete(sortedKey);
        }
      }
    });

  }
});
*/