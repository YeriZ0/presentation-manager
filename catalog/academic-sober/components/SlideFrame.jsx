import { useRef } from 'react';
import { useViewportScale } from '../../../src/hooks/useViewportScale.js';

const VIEWPORT = { width: 1920, height: 1080 };

export function SlideFrame({
    label,
    title,
    children,
    variant = 'standard',
    structure = label,
    context = 'Académica sobria',
    frame = 'none',
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
                    className={`slide-canvas slide-canvas-${variant} slide-canvas-frame-${frame}`}
                    data-template="academic-sober"
                    data-slide-structure={structure}
                    data-frame={frame}
                    style={{ transform: `scale(${scale})` }}
                >
                    {variant === 'standard' && (
                        <header className="slide-header">
                            <span className="slide-context">{context}</span>
                            <h2>{title}</h2>
                        </header>
                    )}
                    {variant === 'standard' ? (
                        <div
                            className="slide-body"
                            data-slide-body
                            data-vertical-align="center"
                        >
                            {children}
                        </div>
                    ) : (
                        children
                    )}
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
