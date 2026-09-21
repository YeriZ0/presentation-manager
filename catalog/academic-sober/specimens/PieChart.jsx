import { createDonutGeometry } from '../../../scripts/lib/donut-geometry.mjs';

const parts = [
    { id: 'digital', label: 'Digital', value: 52 },
    {
        id: 'presencial',
        label: 'Presencial',
        value: 28,
    },
    {
        id: 'telefono',
        label: 'Teléfono',
        value: 12,
    },
    { id: 'otros', label: 'Otros', value: 8 },
];

const chart = createDonutGeometry(parts);
const colorClasses = ['pie-accent', 'pie-dark', 'pie-mid', 'pie-light'];
const colors = new Map(
    [
        ...chart.maxima,
        ...chart.segments.filter((part) => !part.highlighted),
    ].map((part, index) => [part.id, colorClasses[index]]),
);

export function PieChart() {
    return (
        <figure
            className="pie-body"
            data-chart-type="donut"
            data-chart-total="100"
            data-chart-cx={chart.cx}
            data-chart-cy={chart.cy}
            data-chart-inner-radius={chart.innerRadius}
            data-chart-outer-radius={chart.outerRadius}
        >
            <div className="pie-visual">
                <svg
                    viewBox="0 0 600 600"
                    className="pie-svg"
                    role="img"
                    aria-labelledby="pie-chart-title pie-chart-description"
                >
                    <title id="pie-chart-title">
                        La mayoría prefiere el canal digital
                    </title>
                    <desc id="pie-chart-description">
                        {chart.segments
                            .map(({ label, value }) => `${label}: ${value}%`)
                            .join(', ')}
                    </desc>
                    {chart.segments.map(
                        ({ id, label, value, path, highlighted }) => (
                            <path
                                d={path}
                                className={`pie-slice ${colors.get(id)}`}
                                data-chart-segment={id}
                                data-value={value}
                                data-label={label}
                                data-chart-highlight={
                                    highlighted ? '' : undefined
                                }
                                aria-label={`${label}: ${value}%`}
                                key={id}
                            />
                        ),
                    )}
                </svg>
                <div className="pie-center" data-chart-center>
                    {chart.maxima.length > 1 ? (
                        <span data-chart-tie>Empate</span>
                    ) : null}
                    {chart.maxima.map(({ id, label, value }) => (
                        <div data-chart-center-item={id} key={id}>
                            <strong className="pie-total" data-chart-value>
                                {value}%
                            </strong>
                            <span className="pie-caption" data-chart-label>
                                {label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            <ol className="pie-legend" aria-label="Canales de respuesta">
                {chart.segments.map(({ id, label, value }) => (
                    <li data-chart-legend={id} key={id}>
                        <i
                            className={`legend-swatch ${colors.get(id)}`}
                            aria-hidden="true"
                            data-chart-swatch
                        />
                        <span data-chart-label>{label}</span>
                        <strong data-chart-value>{value}%</strong>
                    </li>
                ))}
            </ol>
            <figcaption id="pie-chart-summary">
                Fuente: encuesta de canales, segundo trimestre de 2026. El canal
                digital concentra la mayoría de las respuestas.
            </figcaption>
        </figure>
    );
}
