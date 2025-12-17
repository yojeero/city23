// Note: beforeinstallprompt is primarily supported in Chromium-based browsers
// This functionality may not work in Safari or Firefox

let beforeInstallEvent = null

const initPWA = () => {
  const installButton = document.getElementById("install")

  if (!installButton) {
    console.warn("Install button not found in the DOM")
    return
  }

  // Check if beforeinstallprompt is supported
  window.addEventListener("beforeinstallprompt", (event) => {
    console.log("Install prompt triggered")
    event.preventDefault()
    beforeInstallEvent = event
    installButton.style.display = "block"
  })

  installButton.addEventListener("click", async () => {
    if (beforeInstallEvent) {
      beforeInstallEvent.prompt()
      const { outcome } = await beforeInstallEvent.userChoice
      console.log(`User response: ${outcome}`)
      beforeInstallEvent = null
      installButton.style.display = "none"
    }
  })

  // Check if already installed
  window.addEventListener("appinstalled", () => {
    console.log("PWA installed successfully")
    installButton.style.display = "none"
    beforeInstallEvent = null
  })
}

// Register service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js", { scope: "/" })
      .then((registration) => {
        console.log("ServiceWorker Registered!", registration.scope)

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing
          if (newWorker) {
            console.log("Service worker update found!")
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                console.log("New service worker available. Refresh to update.")
              }
            })
          }
        })

        // Check for updates every hour
        setInterval(() => {
          registration.update()
        }, 3600000)
      })
      .catch((error) => {
        console.error("Failed to Register the ServiceWorker:", error)
      })

    // Initialize PWA install button after DOM is ready
    initPWA()
  })
} else {
  // Still init PWA button even without service worker support
  document.addEventListener("DOMContentLoaded", initPWA)
}
