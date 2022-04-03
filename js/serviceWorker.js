/*

* Attention : CacheStorage != LocalStorage

*

* Il faut définir ici au moins un écouteur d'événement sur 'install' et

* un écouteur d'événement sur 'fetch'

*

*/



// Lors de l'installation de la PWA, charger les ressources puis les mettre en cache

self.addEventListener('install', (e) => {

    e.waitUntil(
  
      caches.open('my-custom-pwa').then((cache) => cache.addAll([
        "/Projet_JS_Hot_Hot_Hot/",
        "/Projet_JS_Hot_Hot_Hot/index.html",
        "/Projet_JS_Hot_Hot_Hot/css/style.css",
        "/Projet_JS_Hot_Hot_Hot/header/html",
        "/Projet_JS_Hot_Hot_Hot/header.css",
        "/Projet_JS_Hot_Hot_Hot/script.js",
        "/Projet_JS_Hot_Hot_Hot/LocalStorageData.js",  
      ])), // à adapter à l'URL du projet
  
    );
  
  });
  
  
  
  // Stratégie "Cache, falling back to network"
  
  // => d'abord vérifier si la ressource n'est pas dans le cache pour la récupérer (offline)
  
  // sinon, récupérer depuis le serveur en ligne (online)
  
  self.addEventListener('fetch', (e) => {
  
    e.respondWith(
  
      caches.match(e.request).then((response) => response || fetch(e.request)),
  
    );
  
  });
  