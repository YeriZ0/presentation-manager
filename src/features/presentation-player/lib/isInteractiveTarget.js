export function isInteractiveTarget(target) {
    if (!(target instanceof Element)) return false;

    const selector =
        'a[href], button, input, select, textarea, [contenteditable="true"], [role="button"], [role="link"], [role="menuitem"]';
    return target.matches(selector) || Boolean(target.closest(selector));
}
