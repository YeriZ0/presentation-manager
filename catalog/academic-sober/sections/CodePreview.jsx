import { SlideFrame } from '../components/SlideFrame.jsx';
import { CodeSpecimen } from '../specimens/CodeSpecimen.jsx';

export function CodePreview() {
    return (
        <section
            className="catalog-section"
            aria-labelledby="code-preview-title"
        >
            <div className="section-intro">
                <span className="eyebrow">03 / Codigo y explicacion</span>
                <h2 id="code-preview-title">
                    El codigo muestra una decision concreta
                </h2>
                <p>
                    El bloque conserva metadatos, rango de lineas, foco y una
                    explicacion adyacente.
                </p>
            </div>
            <div className="preview-grid preview-grid-single">
                <SlideFrame
                    label="code"
                    title="La vista recibe solo los campos que necesita"
                >
                    <CodeSpecimen />
                </SlideFrame>
            </div>
        </section>
    );
}
