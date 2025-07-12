let previousURL = '';

// Timeout for URL observation. Spins up all extension features.
// TODO: replace with navigation event, once that browser feature fully released
export default function observeURL(whenChanged: () => void) {
    setTimeout(() => {
        if (previousURL !== document.location.href) {
            previousURL = document.location.href;
            whenChanged()
        }
        observeURL(whenChanged);
    }, 500);
}