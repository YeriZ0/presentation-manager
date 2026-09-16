export function getBasePath(path) {
    return path.slice(0, path.lastIndexOf('/') + 1);
}

export function getExtension(path) {
    const dotIndex = path.lastIndexOf('.');
    return dotIndex === -1 ? '' : path.slice(dotIndex).toLowerCase();
}

export function hasExtension(path, ...extensions) {
    return extensions.includes(getExtension(path));
}

export function resolveLocalPath(value, basePath) {
    if (/^(data:|blob:|https?:|#|mailto:|javascript:)/i.test(value)) {
        return null;
    }
    return normalizePath(`${basePath}${value.split(/[?#]/, 1)[0]}`);
}

function normalizePath(path) {
    const result = [];
    for (const part of path.split('/')) {
        if (!part || part === '.') continue;
        if (part === '..') result.pop();
        else result.push(part);
    }
    return result.join('/');
}
