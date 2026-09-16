const parts = [
    ['Digital', 52, 'pie-accent'],
    ['Presencial', 28, 'pie-dark'],
    ['Telefono', 12, 'pie-mid'],
    ['Otros', 8, 'pie-light'],
];

export function PieChart() {
    return (
        <div className="pie-body" role="img" aria-labelledby="pie-chart-title pie-chart-summary">
            <svg viewBox="0 0 600 600" className="pie-svg">
                <title id="pie-chart-title">La mayoria prefiere el canal digital</title>
                <desc>Distribucion de canales: digital 52%, presencial 28%, telefono 12% y otros 8%.</desc>
                <circle cx="300" cy="300" r="190" className="pie-base" />
                <path d="M 300 300 L 300 110 A 190 190 0 1 1 182 151 Z" className="pie-slice pie-accent" />
                <path d="M 300 300 L 182 151 A 190 190 0 0 1 476 390 Z" className="pie-slice pie-dark" />
                <path d="M 300 300 L 476 390 A 190 190 0 0 1 357 483 Z" className="pie-slice pie-mid" />
                <path d="M 300 300 L 357 483 A 190 190 0 0 1 300 490 Z" className="pie-slice pie-light" />
                <circle cx="300" cy="300" r="82" className="pie-center" />
                <text x="300" y="292" textAnchor="middle" className="pie-total">52%</text>
                <text x="300" y="322" textAnchor="middle" className="pie-caption">digital</text>
            </svg>
            <div className="pie-legend">{parts.map(([name, value, color]) => <div key={name}><i className={`legend-dot ${color}`} /> <span>{name}</span><strong>{value}%</strong></div>)}</div>
            <p id="pie-chart-summary">Fuente: encuesta de canales, segundo trimestre de 2026. El canal digital concentra la mayoria de las respuestas.</p>
        </div>
    );
}
