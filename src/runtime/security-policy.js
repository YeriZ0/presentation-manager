export function buildContentSecurityPolicy(deck) {
    const resources = deck.externalResources || {};
    const imageHosts = toSources(resources.imageHosts);
    const stylesheetHosts = toSources(resources.fontStylesheetHosts);
    const fontHosts = toSources(resources.fontHosts);

    return [
        "default-src 'none'",
        "script-src 'unsafe-inline' blob:",
        `style-src 'unsafe-inline' blob: ${stylesheetHosts}`,
        `img-src 'self' data: blob: ${imageHosts}`,
        `font-src 'self' data: blob: ${fontHosts}`,
        "media-src 'none'",
        "connect-src 'none'",
        "object-src 'none'",
        "frame-src 'none'",
        "form-action 'none'",
        "base-uri 'none'",
    ].join('; ');
}

function toSources(hosts = []) {
    return hosts.map((host) => `https://${host}`).join(' ');
}
