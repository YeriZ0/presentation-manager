export function getFontFormat(extension) {
    return {
        ttf: 'truetype',
        otf: 'opentype',
        woff: 'woff',
        woff2: 'woff2',
    }[extension.toLowerCase()];
}
