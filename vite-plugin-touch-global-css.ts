// vite-plugin-touch-global-css.ts

import fs from 'fs';
import { type Plugin } from 'vite';

function touchFile(filePath: string): void {
    const time = new Date();
    fs.utimesSync(filePath, time, time);
}

type TouchGlobalCSSPluginOptions = {
    cssFilePath: string;
    watchFiles: string[];
};

export default function touchGlobalCSSPlugin({
    cssFilePath,
    watchFiles,
}: TouchGlobalCSSPluginOptions): Plugin {
    return {
        name: 'touch-global-css',
        configureServer(server) {
            server.watcher.on('change', (file) => {
                file = file.replace(/\\/g, '/')
                if (watchFiles.some((watchFile) => file.includes(watchFile))) {
                    touchFile(cssFilePath);
                }
            });
        },
    };
}