const values = [78, 62, 49, 31];
const labels = ['Analisis', 'Diseno', 'Pruebas', 'Entrega'];

export function BarChart() {
    return (
        <div
            className="chart-body"
            role="img"
            aria-labelledby="bar-chart-title bar-chart-summary"
        >
            <svg viewBox="0 0 1500 560" className="chart-svg">
                <title id="bar-chart-title">
                    El análisis concentra la mayor carga del proyecto
                </title>
                <desc>
                    Horas estimadas por etapa: análisis 78, diseño 62, pruebas
                    49 y entrega 31.
                </desc>
                {[0, 25, 50, 75, 100].map((tick) => (
                    <g key={tick}>
                        <line
                            x1={220 + tick * 10}
                            x2={220 + tick * 10}
                            y1="60"
                            y2="480"
                            className="chart-grid"
                        />
                        <text
                            x={220 + tick * 10}
                            y="520"
                            className="chart-tick"
                            textAnchor="middle"
                        >
                            {tick}
                        </text>
                    </g>
                ))}
                {values.map((value, index) => (
                    <g key={labels[index]}>
                        <text
                            x="0"
                            y={130 + index * 95}
                            className="chart-label"
                        >
                            {labels[index]}
                        </text>
                        <rect
                            x="220"
                            y={102 + index * 95}
                            width={value * 10}
                            height="42"
                            rx="21"
                            className={
                                index === 0
                                    ? 'chart-bar chart-bar-accent'
                                    : 'chart-bar'
                            }
                        />
                        <text
                            x={240 + value * 10}
                            y={130 + index * 95}
                            className="chart-value"
                        >
                            {value} h
                        </text>
                    </g>
                ))}
                <text x="220" y="555" className="chart-axis-label">
                    Horas estimadas · Enero a junio de 2026
                </text>
            </svg>
            <p id="bar-chart-summary">
                Fuente: estimación del equipo. El análisis requiere 26% más
                tiempo que el diseño.
            </p>
        </div>
    );
}
