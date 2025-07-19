import './contentScript.css';
import observeURL from './src/utilities/observeUrl';
import { initializeFeatures } from './src/features';

observeURL(initializeFeatures);