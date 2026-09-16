var root = document.documentElement;
var activated = false;

function activate() {
    if (activated) return;
    activated = true;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        root.classList.add('is-active');
        return;
    }
    requestAnimationFrame(function () {
        root.classList.add('is-active');
    });
}

window.addEventListener('web-deck:activate', activate, { once: true });

if (window.parent === window) {
    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', activate, { once: true });
    } else {
        activate();
    }
}
