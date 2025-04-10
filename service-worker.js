self.addEventListener('install', (event) => {
  event.waitUntil(
      caches.open('my-cache').then((cache) => {
          return cache.addAll([
              '/',
              '/index.html',
              '/css/style.css',
              '/js/main-sw.js',
              '/js/pwa-handler.js',
              '/images/fav.svg',
              // Add any other assets you want to cache
          ]);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // For API calls or dynamic content, use network first
  if (event.request.url.includes('/api/') || event.request.url.includes('/dynamic/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          return caches.open('my-cache')
            .then(cache => {
              cache.put(event.request, response.clone());
              return response;
            });
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // For static assets, use cache first
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});

// Add timestamp to cached responses
const addTimestampToCacheEntry = (request, response) => {
    const clonedResponse = response.clone();
    return caches.open('my-cache')
      .then(cache => {
        const metadata = {
          url: request.url,
          timestamp: Date.now()
        };
        // Store metadata in a separate cache
        cache.put(`metadata-${request.url}`, new Response(JSON.stringify(metadata)));
        return cache.put(request, clonedResponse);
      });
};

// Check if cache is stale (older than 24 hours)
const isCacheStale = (url) => {
    return caches.open('my-cache')
      .then(cache => cache.match(`metadata-${url}`))
      .then(metadataResponse => {
        if (!metadataResponse) return true;
        return metadataResponse.json()
          .then(metadata => {
            const age = Date.now() - metadata.timestamp;
            return age > 24 * 60 * 60 * 1000; // 24 hours
          });
      })
      .catch(() => true); // If any error, consider cache stale
};