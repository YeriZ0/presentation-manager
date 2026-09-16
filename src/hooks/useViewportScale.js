import { useEffect, useState } from 'react';

export function useViewportScale(elementRef, viewport) {
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return undefined;

        function updateScale() {
            const bounds = element.getBoundingClientRect();
            setScale(
                Math.min(
                    bounds.width / viewport.width,
                    bounds.height / viewport.height,
                ),
            );
        }

        const observer = new ResizeObserver(updateScale);
        observer.observe(element);
        updateScale();
        return () => observer.disconnect();
    }, [elementRef, viewport.height, viewport.width]);

    return scale;
}
