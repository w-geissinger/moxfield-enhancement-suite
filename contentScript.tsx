import './contentScript.css';
import setupTCGImporter from './src/features/import'

let previousURL = '';

// Timeout for URL observation. Spins up all extension features.
// TODO: replace with navigation event, once that browser feature fully released
const ObserveURL = () => setTimeout(() => {
    if (previousURL !== document.location.href) {
        previousURL = document.location.href;
        /**
         * BEGIN FEATURE SETUP Calls
         */


        setupTCGImporter();


        /**
         * END FEATURE SETUP Calls
         */
    }
    ObserveURL();
}, 500);

ObserveURL();

