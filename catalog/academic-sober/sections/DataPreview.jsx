import { SlideFrame } from '../components/SlideFrame.jsx';
import { BarChart } from '../specimens/BarChart.jsx';
import { LineChart } from '../specimens/LineChart.jsx';
import { PieChart } from '../specimens/PieChart.jsx';
import { TableSpecimen } from '../specimens/TableSpecimen.jsx';

export function DataPreview() {
    return (
        <section
            className="catalog-section"
            aria-labelledby="data-preview-title"
        >
            <div className="section-intro">
                <span className="eyebrow">02 / Datos y evidencia</span>
                <h2 id="data-preview-title">
                    Las gráficas son evidencia, no decoración
                </h2>
                <p>
                    Cada muestra conserva conclusión, unidad, período, fuente y
                    una alternativa textual.
                </p>
            </div>
            <div className="preview-grid">
                <SlideFrame
                    label="table"
                    title="La alternativa híbrida equilibra las restricciones"
                >
                    <TableSpecimen />
                </SlideFrame>
                <SlideFrame
                    label="chart / bars"
                    structure="chart"
                    title="El análisis concentra la mayor carga"
                >
                    <BarChart />
                </SlideFrame>
                <SlideFrame
                    label="chart / line"
                    structure="chart"
                    title="La adopción aumenta durante el período"
                >
                    <LineChart />
                </SlideFrame>
                <SlideFrame
                    label="chart / pie"
                    structure="chart"
                    title="La mayoría prefiere el canal digital"
                >
                    <PieChart />
                </SlideFrame>
            </div>
        </section>
    );
}
