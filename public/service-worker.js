/* eslint-disable no-undef */
const CACHE_NAME = 'city23-cache-v1'

// Files to cache on install
const CACHE_FILES = [
  '/',
  '/index.html',
  '/css/style.css',
  '/manifest.json',
  '/images/city23.svg',
  '/images/cup.webp',
  '/images/fav.svg',
  '/images/train.svg',
  '/images/walk.svg',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-512x512.png',
  '/images/icons/maskable_icon.png',
  '/images/icons/apple-touch-icon.png',
  '/fonts/dosis.woff2',
  '/fonts/dosis-700.woff2',
  '/js/pwa-handler.js',
  '/js/main-sw.js'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_FILES).catch(err => {
        console.warn('Failed to cache some files:', err)
        // Continue even if some files fail to cache
        return Promise.resolve()
      })
    })
  )
  // Force the waiting service worker to become the active service worker
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(keys =>
        Promise.all(
          keys.map(key => {
            if (key !== CACHE_NAME) {
              return caches.delete(key)
            }
          })
        )
      ),
      // Take control of all clients immediately
      self.clients.claim()
    ])
  )
})

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return

  // не кэшируем стрим
  if (event.request.destination === 'audio') return

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return

  const isNavigation =
    event.request.mode === 'navigate' ||
    event.request.destination === 'document'

  event.respondWith(
    (isNavigation
      ? networkFirst(event.request)
      : cacheFirst(event.request)
    ).catch(err => {
      console.error('Service worker fetch error:', err)
      // Fallback to network for navigation requests
      if (isNavigation) {
        return fetch(event.request)
      }
      // Return a basic response for other requests
      return new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
    })
  )
})

async function cacheFirst(request) {
  try {
    const cache = await caches.open(CACHE_NAME)
    const cached = await cache.match(request)
    if (cached) return cached

    const fresh = await fetch(request)
    if (fresh && fresh.status === 200) {
      cache.put(request, fresh.clone()).catch(err => {
        console.warn('Failed to cache response:', err)
      })
    }
    return fresh
  } catch (err) {
    console.error('Cache first error:', err)
    return fetch(request)
  }
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME)

  try {
    const fresh = await fetch(request)
    if (fresh && fresh.status === 200) {
      cache.put(request, fresh.clone()).catch(err => {
        console.warn('Failed to cache response:', err)
      })
    }
    return fresh
  } catch (err) {
    console.warn('Network request failed, trying cache:', err)
    const cached = await cache.match(request)
    if (cached) return cached
    // If no cache and network fails, throw to trigger fallback
    throw err
  }
}
