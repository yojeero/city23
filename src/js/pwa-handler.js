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

if (typeof serviceWorker !== 'undefined') {
    serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
            console.log("ServiceWorker Registered to the Application!");
            
            // Check for updates periodically
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('Service worker update found!');
                // You could notify the user about the update
            });
        })
        .catch((error) => console.log("Failed to Register the ServiceWorker:", error));
}

