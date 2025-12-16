const CACHE_NAME = 'my-cache-v1'
const META_CACHE = 'my-cache-meta-v1'
const MAX_CACHE_AGE = 24 * 60 * 60 * 1000

const STATIC_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/main-sw.js',
  './js/pwa-handler.js',
  './images/fav.svg'
]

self.addEventListener('install', event => {
  self.skipWaiting()

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(
        STATIC_ASSETS.map(asset => cache.add(asset))
      )
    )
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => ![CACHE_NAME, META_CACHE].includes(k))
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return

  const isApi =
    event.request.url.includes('/api/') ||
    event.request.url.includes('/dynamic/')

  event.respondWith(
    isApi
      ? networkFirst(event.request)
      : cacheFirst(event.request)
  )
})

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request)

  if (cached && !(await isCacheStale(request.url))) {
    return cached
  }

  try {
    const fresh = await fetch(request)
    await addTimestampToCacheEntry(request, fresh)
    return fresh
  } catch {
    return cached || Response.error()
  }
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME)

  try {
    const fresh = await fetch(request)
    await addTimestampToCacheEntry(request, fresh)
    return fresh
  } catch {
    return cache.match(request)
  }
}

async function addTimestampToCacheEntry(request, response) {
  const cache = await caches.open(CACHE_NAME)
  const meta = await caches.open(META_CACHE)

  await meta.put(
    request.url,
    new Response(JSON.stringify({ timestamp: Date.now() }))
  )

  await cache.put(request, response.clone())
}

async function isCacheStale(url) {
  const meta = await caches.open(META_CACHE)
  const res = await meta.match(url)
  if (!res) return true

  const { timestamp } = await res.json()
  return Date.now() - timestamp > MAX_CACHE_AGE
}
