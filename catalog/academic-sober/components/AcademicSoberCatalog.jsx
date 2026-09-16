import { CodePreview } from '../sections/CodePreview.jsx';
import { DataPreview } from '../sections/DataPreview.jsx';
import { FullTemplatePreview } from '../sections/FullTemplatePreview.jsx';

export function AcademicSoberCatalog() {
    return (
        <main className="catalog-page">
            <header className="catalog-hero">
                <div>
                    <span className="eyebrow">
                        Catalogo de referencia · React
                    </span>
                    <h1>Academica sobria</h1>
                    <p>
                        Una referencia visual para construir diapositivas
                        institucionales con las estructuras autorizadas de la
                        plantilla.
                    </p>
                </div>
                <dl className="hero-facts">
                    <div>
                        <dt>Viewport</dt>
                        <dd>1920 x 1080</dd>
                    </div>
                    <div>
                        <dt>Paleta</dt>
                        <dd>Grafito + acento</dd>
                    </div>
                    <div>
                        <dt>Motor</dt>
                        <dd>HTML / CSS / SVG / ECharts</dd>
                    </div>
                </dl>
            </header>
            <FullTemplatePreview />
            <DataPreview />
            <CodePreview />
            <footer className="catalog-end">
                <span>academic-sober</span>
                <span>Referencia interna de composicion</span>
            </footer>
        </main>
    );
}
