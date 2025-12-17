// Note: beforeinstallprompt is primarily supported in Chromium-based browsers
// This functionality may not work in Safari or Firefox

const installButton = document.getElementById("install");
// Add null check before using installButton
if (!installButton) {
    console.warn("Install button not found in the DOM");
    return;
}

// Check if beforeinstallprompt is supported
if (window.addEventListener && typeof window.beforeinstallprompt !== 'undefined') {
    window.addEventListener("beforeinstallprompt", (event) => {
        console.log("Install prompt triggered");
        event.preventDefault();
        beforeInstallEvent = event;
        if (installButton) {
            installButton.style.display = "block";
        }
    });

    // Add this to check if installation is supported
    window.addEventListener('DOMContentLoaded', () => {
        console.log("PWA installation supported:", 'BeforeInstallPromptEvent' in window);
    });
}

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/service-worker.js', { scope: '/' })
            .then((registration) => {
                console.log("ServiceWorker Registered to the Application!", registration.scope);
                
                // Check for updates periodically
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        console.log('Service worker update found!');
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.log('New service worker available. Refresh to update.');
                            }
                        });
                    }
                });
                
                // Check for updates every hour
                setInterval(() => {
                    registration.update();
                }, 3600000);
            })
            .catch((error) => {
                console.error("Failed to Register the ServiceWorker:", error);
            });
    });
}

