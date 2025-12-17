/* eslint-disable no-undef */
const CACHE_NAME = "city23-cache-v4"

const CACHE_FILES = [
  "/",
  "/index.html",
  "/images/fav.svg",
  "/fonts/dosis.woff2",
  "/fonts/dosis-700.woff2",
  "/js/pwa-handler.js"
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHE_FILES).catch((err) => {
        console.warn("Failed to cache some files:", err)
        return Promise.resolve()
      })
    }),
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key)
            }
          }),
        ),
      ),
      self.clients.claim(),
    ]),
  )
})

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return

  // Don't cache audio stream
  if (event.request.destination === "audio") return

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return

  const isNavigation = event.request.mode === "navigate" || event.request.destination === "document"

  event.respondWith(
    (isNavigation ? networkFirst(event.request) : cacheFirst(event.request)).catch((err) => {
      console.error("Service worker fetch error:", err)
      if (isNavigation) {
        return caches.match("/index.html").then((cached) => {
          if (cached) return cached
          return fetch(event.request)
        })
      }
      return new Response("Offline", { status: 503, statusText: "Service Unavailable" })
    }),
  )
})

async function cacheFirst(request) {
  try {
    const cache = await caches.open(CACHE_NAME)
    const cached = await cache.match(request)
    if (cached) return cached

    const fresh = await fetch(request)
    if (fresh && fresh.status === 200) {
      cache.put(request, fresh.clone()).catch((err) => {
        console.warn("Failed to cache response:", err)
      })
    }
    return fresh
  } catch (err) {
    console.error("Cache first error:", err)
    return fetch(request)
  }
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME)

  try {
    const fresh = await fetch(request)
    if (fresh && fresh.status === 200) {
      cache.put(request, fresh.clone()).catch((err) => {
        console.warn("Failed to cache response:", err)
      })
    }
    return fresh
  } catch (err) {
    console.warn("Network request failed, trying cache:", err)
    const cached = await cache.match(request)
    if (cached) return cached
    const indexCached = await cache.match("/index.html")
    if (indexCached) return indexCached
    throw err
  }
}
