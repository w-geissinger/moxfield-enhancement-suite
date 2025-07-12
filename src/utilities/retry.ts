export default async function retryUntilSuccess(callback: () => void, predicate: () => boolean, period?: number): Promise<void> {
    return new Promise(resolve => {
        retryInternal(callback, predicate, resolve, period)
    });
}

function retryInternal(callback: () => void, predicate: () => boolean, resolve: () => void, period?: number) {
    setTimeout(() => {
        callback();
        if (!predicate()) {
            retryInternal(callback, predicate, resolve, period)
        } else {
            resolve();
        }
    }, period ?? 500)
}