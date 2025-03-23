
// Reference the serviceWorker.
const serviceWorker = navigator.serviceWorker;

// Register our ServiceWorker script, if serviceWorker is available.
if (serviceWorker) {
    serviceWorker
        .register("../service-worker.js")
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

// Create a variable to defer the beforeinstallprompt event.
let beforeInstallEvent;

// Reference the install button from DOM.
const installButton = document.getElementById("install");
// Add null check before using installButton
if (!installButton) {
    console.warn("Install button not found in the DOM");
    return;
};

// Note: beforeinstallprompt is primarily supported in Chromium-based browsers
// This functionality may not work in Safari or Firefox

// Check if beforeinstallprompt is supported
if (window.addEventListener && typeof window.beforeinstallprompt !== 'undefined') {
    window.addEventListener("beforeinstallprompt", (event) => {
        event.preventDefault();
        beforeInstallEvent = event;
        installButton.style.display = "block";
    });
}

// Prompt for Installation when install button is clicked.
installButton.addEventListener("click", () => {
    beforeInstallEvent
        .prompt()
        .then((choice) => {
            // Hide the install button as its purpose is over.
            if (choice.outcome == "accepted") {
                installButton.style.display = "none";
            }
        });
});
