# Todo-List PWA  
A todo-list in the progressive web app design.
Create tasks or set executed tasks to done.

The app can be found on heroku: [todo-list-pwa]( https://todo-list-pwa.herokuapp.com/)

## Supported Features  
Our PWA supports following features:

### Caching on Install
Initial caching of layout-specific files as soon as the service-worker is installed.

### Offline Strategy
Get layout-specific files first from cache. If they don't exist in the cache, fall
back to network and fetch them. The fetch-responses are cached.

Tasks are always fetched from network if the user is online. If the user is offline,
the cached tasks are served.

### Background Sync  
The user can still use the app when offline.  
If the user is offline, he will be notified with a offline-banner.  
Creating a task or setting a task to done will be stored in the indexed-database
and as soon the user is back online, the operations will be sent to the server.
