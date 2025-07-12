import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'
import tailwindcss from '@tailwindcss/vite'
import viteTouchGlobalCss from './vite-plugin-touch-global-css';
import path from 'path'


// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), viteTouchGlobalCss({
        cssFilePath: path.resolve(__dirname, 'contentScript.css'),
        watchFiles: ['.tsx'],
    }), tailwindcss(), crx({ manifest })],
})
