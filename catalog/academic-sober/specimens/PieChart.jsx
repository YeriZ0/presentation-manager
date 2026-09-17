const parts = [
    { id: 'digital', label: 'Digital', value: 52, className: 'pie-accent' },
    {
        id: 'presencial',
        label: 'Presencial',
        value: 28,
        className: 'pie-dark',
    },
    {
        id: 'telefono',
        label: 'Teléfono',
        value: 12,
        className: 'pie-mid',
    },
    { id: 'otros', label: 'Otros', value: 8, className: 'pie-light' },
];

const CENTER = 300;
const OUTER_RADIUS = 190;
const INNER_RADIUS = 88;

function pointOnCircle(radius, angle) {
    const radians = ((angle - 90) * Math.PI) / 180;
    return {
        x: CENTER + radius * Math.cos(radians),
        y: CENTER + radius * Math.sin(radians),
    };
}

function createDonutPath(startAngle, endAngle) {
    const outerStart = pointOnCircle(OUTER_RADIUS, startAngle);
    const outerEnd = pointOnCircle(OUTER_RADIUS, endAngle);
    const innerStart = pointOnCircle(INNER_RADIUS, startAngle);
    const innerEnd = pointOnCircle(INNER_RADIUS, endAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return [
        `M ${outerStart.x} ${outerStart.y}`,
        `A ${OUTER_RADIUS} ${OUTER_RADIUS} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
        `L ${innerEnd.x} ${innerEnd.y}`,
        `A ${INNER_RADIUS} ${INNER_RADIUS} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
        'Z',
    ].join(' ');
}

export function PieChart() {
    let angle = 0;
    const segments = parts.map((part) => {
        const startAngle = angle;
        angle += part.value * 3.6;
        return { ...part, path: createDonutPath(startAngle, angle) };
    });

    return (
        <figure
            className="pie-body"
            data-chart-type="donut"
            data-chart-total="100"
        >
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
                    Distribución de canales: Digital 52%, Presencial 28%,
                    Teléfono 12% y Otros 8%.
                </desc>
                {segments.map(({ id, label, value, className, path }) => (
                    <path
                        d={path}
                        className={`pie-slice ${className}`}
                        data-chart-segment={id}
                        data-value={value}
                        aria-label={`${label}: ${value}%`}
                        key={id}
                    />
                ))}
                <text x="300" y="292" textAnchor="middle" className="pie-total">
                    52%
                </text>
                <text
                    x="300"
                    y="322"
                    textAnchor="middle"
                    className="pie-caption"
                >
                    Digital
                </text>
            </svg>
            <ol className="pie-legend" aria-label="Canales de respuesta">
                {segments.map(({ id, label, value, className }) => (
                    <li data-chart-legend={id} key={id}>
                        <i
                            className={`legend-swatch ${className}`}
                            aria-hidden="true"
                        />
                        <span>{label}</span>
                        <strong>{value}%</strong>
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
