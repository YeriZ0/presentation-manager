/** Freeze measured border boxes without rerunning flex/grid layout */
export function restoreSnapshotLayout(fragment) {
    for (const node of fragment.querySelectorAll('[data-export-box]')) {
        let box;
        try {
            box = JSON.parse(node.getAttribute('data-export-box'));
        } catch {
            throw new Error('La captura contiene una posición inválida');
        }
        if (
            !Array.isArray(box) ||
            box.length !== 4 ||
            !box.every(Number.isFinite) ||
            box[2] <= 0 ||
            box[3] <= 0 ||
            box.some((value) => Math.abs(value) > 32768)
        ) {
            throw new Error('La captura contiene dimensiones no válidas');
        }

        const parent = node.parentElement?.closest('[data-export-box]');
        const parentBox = parent
            ? JSON.parse(parent.getAttribute('data-export-box'))
            : [0, 0];
        const borderLeft = parent
            ? parseFloat(parent.style.borderLeftWidth) || 0
            : 0;
        const borderTop = parent
            ? parseFloat(parent.style.borderTopWidth) || 0
            : 0;
        if (node.style.display.includes('flex')) {
            const column = node.style.flexDirection.startsWith('column');
            const horizontal = column
                ? node.style.alignItems
                : node.style.justifyContent;
            const vertical = column
                ? node.style.justifyContent
                : node.style.alignItems;
            if (horizontal === 'center') node.style.textAlign = 'center';
            if (vertical === 'center') node.style.verticalAlign = 'middle';
        }
        for (const property of Array.from(node.style)) {
            if (
                /^(?:inset|margin|min-|max-|block-size|inline-size|animation|transition)/.test(
                    property,
                )
            ) {
                node.style.removeProperty(property);
            }
        }
        Object.assign(node.style, {
            position: 'absolute',
            display: 'block',
            boxSizing: 'border-box',
            left: `${box[0] - parentBox[0] - borderLeft}px`,
            top: `${box[1] - parentBox[1] - borderTop}px`,
            right: 'auto',
            bottom: 'auto',
            width: `${box[2]}px`,
            height: `${box[3]}px`,
            margin: '0',
            transform: 'none',
            translate: 'none',
            scale: 'none',
            rotate: 'none',
        });
    }
}
