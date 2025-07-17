export function rateLimitedMap<T, K>(action: (value: T, index: number, array: T[]) => Promise<K>, array: T[], rate?: number): Promise<K>[] {

    const _rate = rate ?? 1000;

    return array.map((value, index) => {
        return new Promise(res => {
            setTimeout(() => {
                const response = action(value, index, array);
                res(response)
            }, _rate * index + 1)
        })
    });
}