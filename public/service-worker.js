const CACHE_NAME = 'city23-cache-v1'

const BASE = self.location.origin +
  self.location.pathname.replace(/[^/]+$/, '')

const STATIC_ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'css/style.css',
  BASE + 'js/main.js',
  BASE + 'js/main-sw.js',
  BASE + 'js/pwa-handler.js',
  BASE + 'images/fav.svg'
]

// INSTALL
self.addEventListener('install', event => {
  self.skipWaiting()

  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      for (const asset of STATIC_ASSETS) {
        try {
          await cache.add(asset)
        } catch (e) {
          console.warn('SW cache skip:', asset)
        }
      }
    })
  )
})

// ACTIVATE
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  )
})

// FETCH
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return

  // не кэшируем аудио-стрим
  if (event.request.destination === 'audio') return

  const isNavigation =
    event.request.mode === 'navigate' ||
    event.request.destination === 'document'

  event.respondWith(
    isNavigation
      ? networkFirst(event.request)
      : cacheFirst(event.request)
  )
})

// STRATEGIES
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request)

  if (cached) return cached

  const fresh = await fetch(request)
  cache.put(request, fresh.clone())
  return fresh
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME)

  try {
    const fresh = await fetch(request)
    cache.put(request, fresh.clone())
    return fresh
  } catch {
    return cache.match(request)
  }
}
