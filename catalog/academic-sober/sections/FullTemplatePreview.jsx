import { SlideFrame } from '../components/SlideFrame.jsx';
import { ClosingSpecimen } from '../specimens/ClosingSpecimen.jsx';
import { ComparisonSpecimen } from '../specimens/ComparisonSpecimen.jsx';
import { CoverSpecimen } from '../specimens/CoverSpecimen.jsx';
import { MixedContentSpecimen } from '../specimens/MixedContentSpecimen.jsx';
import { NarrativeSpecimen } from '../specimens/NarrativeSpecimen.jsx';
import { ProcessSpecimen } from '../specimens/ProcessSpecimen.jsx';
import { ReferencesSpecimen } from '../specimens/ReferencesSpecimen.jsx';
import { SystemDiagram } from '../specimens/SystemDiagram.jsx';
import { ThematicSpecimen } from '../specimens/ThematicSpecimen.jsx';

export function FullTemplatePreview() {
    return (
        <section
            className="catalog-section"
            aria-labelledby="template-preview-title"
        >
            <div className="section-intro">
                <span className="eyebrow">01 / Estructuras existentes</span>
                <h2 id="template-preview-title">
                    La identidad se mantiene al cambiar la estructura
                </h2>
                <p>
                    Estas muestras siguen literalmente las composiciones
                    documentadas por academic-sober.
                </p>
            </div>
            <div className="preview-grid">
                <SlideFrame label="cover" variant="cover">
                    <CoverSpecimen />
                </SlideFrame>
                <SlideFrame
                    label="pillars / 2"
                    structure="pillars"
                    title="Dos condiciones eliminan la barrera"
                >
                    <ThematicSpecimen set="two" />
                </SlideFrame>
                <SlideFrame
                    label="pillars / 3"
                    structure="pillars"
                    title="Tres decisiones sostienen el modelo"
                >
                    <ThematicSpecimen set="three" />
                </SlideFrame>
                <SlideFrame
                    label="pillars / 4"
                    structure="pillars"
                    title="Cuatro frentes mantienen el avance"
                >
                    <ThematicSpecimen set="four" />
                </SlideFrame>
                <SlideFrame
                    label="comparison"
                    title="La alternativa híbrida mantiene el equilibrio"
                >
                    <ComparisonSpecimen />
                </SlideFrame>
                <SlideFrame
                    label="process"
                    title="El resultado mejora cuando cada etapa deja evidencia"
                >
                    <ProcessSpecimen />
                </SlideFrame>
                <SlideFrame
                    label="mixed-content"
                    title="Una regla simple reduce el trabajo posterior"
                >
                    <MixedContentSpecimen />
                </SlideFrame>
                <SlideFrame
                    label="narrative-elements"
                    title="La evidencia necesita una lectura guiada"
                >
                    <NarrativeSpecimen />
                </SlideFrame>
                <SlideFrame
                    label="system-diagram"
                    title="Las partes se entienden por su relación"
                >
                    <SystemDiagram />
                </SlideFrame>
                <SlideFrame
                    label="references"
                    title="La trazabilidad también es parte del argumento"
                >
                    <ReferencesSpecimen />
                </SlideFrame>
                <SlideFrame label="closing" variant="closing">
                    <ClosingSpecimen />
                </SlideFrame>
            </div>
        </section>
    );
}
