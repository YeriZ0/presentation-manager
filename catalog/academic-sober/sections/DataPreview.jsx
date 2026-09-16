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
                    Las graficas son evidencia, no decoracion
                </h2>
                <p>
                    Cada muestra conserva conclusion, unidad, periodo, fuente y
                    una alternativa textual.
                </p>
            </div>
            <div className="preview-grid">
                <SlideFrame
                    label="table"
                    title="La alternativa hibrida equilibra las restricciones"
                >
                    <TableSpecimen />
                </SlideFrame>
                <SlideFrame
                    label="chart / bars"
                    title="El analisis concentra la mayor carga"
                >
                    <BarChart />
                </SlideFrame>
                <SlideFrame
                    label="chart / line"
                    title="La adopcion aumenta durante el periodo"
                >
                    <LineChart />
                </SlideFrame>
                <SlideFrame
                    label="chart / pie"
                    title="La mayoria prefiere el canal digital"
                >
                    <PieChart />
                </SlideFrame>
            </div>
        </section>
    );
}
