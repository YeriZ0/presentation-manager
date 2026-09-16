import { useRef } from 'react';
import { useViewportScale } from '../../../src/hooks/useViewportScale.js';

const VIEWPORT = { width: 1920, height: 1080 };

export function SlideFrame({
    label,
    title,
    children,
    variant = 'standard',
    structure = label,
}) {
    const viewportRef = useRef(null);
    const scale = useViewportScale(viewportRef, VIEWPORT);

    return (
        <article className={`catalog-entry catalog-entry-${variant}`}>
            <div className="catalog-entry-heading">
                <span>{label}</span>
                <span>1920 x 1080</span>
            </div>
            <div className="slide-viewport slide-frame" ref={viewportRef}>
                <div
                    className={`slide-canvas slide-canvas-${variant}`}
                    data-template="academic-sober"
                    data-slide-structure={structure}
                    style={{ transform: `scale(${scale})` }}
                >
                    {variant === 'standard' && (
                        <header className="slide-header">
                            <span className="slide-category">
                                Academica sobria
                            </span>
                            <h2>{title}</h2>
                        </header>
                    )}
                    {children}
                    {variant === 'standard' && (
                        <footer className="slide-footer">
                            <span>Referencia visual</span>
                            <span>academic-sober</span>
                        </footer>
                    )}
                </div>
            </div>
        </article>
    );
}
