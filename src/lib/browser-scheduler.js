/** Keep native timer calls bound to their owning Window */
export function createBrowserScheduler(host = window) {
    return {
        setTimeout: (callback, delay, ...args) =>
            host.setTimeout(callback, delay, ...args),
        clearTimeout: (handle) => host.clearTimeout(handle),
        setInterval: (callback, delay, ...args) =>
            host.setInterval(callback, delay, ...args),
        clearInterval: (handle) => host.clearInterval(handle),
    };
}
