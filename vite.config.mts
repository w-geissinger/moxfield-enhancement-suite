import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx, defineManifest } from '@crxjs/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import viteTouchGlobalCss from './vite-plugin-touch-global-css';
import path from 'path'

const manifest = defineManifest({
    "name": "Moxfield Enhancement Suite",
    "description": "An enhancement suite for Moxfield",
    "version": "0.1.0",
    "manifest_version": 3,
    "icons": {
        "16": "public/icon16.png",
        "48": "public/icon48.png",
        "128": "public/icon128.png"
    },
    "action": {
        "default_popup": "popup.html",
        "default_icon": {}
    },
    "content_scripts": [
        {
            "matches": [
                "https://moxfield.com/**"
            ],
            "run_at": "document_end",
            "js": [
                "contentScript.tsx"
            ]
        }
    ]
})

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        viteTouchGlobalCss({
            cssFilePath: path.resolve(__dirname, 'contentScript.css'),
            watchFiles: ['.tsx'],
        }),
        tailwindcss(),
        crx({
            manifest,
            browser: 'chrome',
        }),
    ]

})
