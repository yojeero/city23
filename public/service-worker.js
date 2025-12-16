/* eslint-disable no-undef */
self.skipWaiting()
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()))

const CACHE_NAME = 'city23-cache-v1'

self.addEventListener('activate', async () => {
  const keys = await caches.keys()
  await Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)))
})


//__WB_MANIFEST will be substituted by Vite automatically
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(self.__WB_MANIFEST.map(e => e.url))
    )
  )
})

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return

  // не кэшируем стрим
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
