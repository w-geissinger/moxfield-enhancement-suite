import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ImportButton from './ImportButton';
import retryUntilSuccess from '../../utilities/retry';

const observerConfig = { childList: true, subtree: false };

const observer = new MutationObserver(() => {
    if (!document.getElementById('mes-importer-root')) {
        console.log('observer ran')
        decorate();
    }
});

export default async function setupTCGImporter() {
    if (document.location.pathname.startsWith('/collection')) {
        if (!document.getElementById('mes-importer-root')) {
            await retryUntilSuccess(() => {
                decorate();
            }, () => !!document.getElementById('mes-importer-root'));
            const mountingElement = getMountElement();
            if (mountingElement) {
                observer.observe(mountingElement, observerConfig);
            } else {
                console.error('MES could not locate the header for observing changes')
            }
        }
    }
}

function getMountElement(): HTMLHeadingElement | null | undefined {
    return document?.getElementById('maincontent')?.querySelector('h1');
}

function decorate(): void {
    const mountElement = getMountElement();
    if (mountElement) {
        console.log('Mounting MES TCGPlayer Import controls...')
        createRoot(mountElement).render(
            <StrictMode>
                <ImportButton />
            </StrictMode>,
        )
    }
}