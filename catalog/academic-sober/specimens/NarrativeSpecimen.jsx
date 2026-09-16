const elements = [
    ['Calidad', 'Los registros mantienen una fuente identificable.'],
    ['Tiempo', 'Las decisiones se comparan dentro del mismo periodo.'],
    ['Alcance', 'La conclusion declara a quien representa el dato.'],
];

export function NarrativeSpecimen() {
    return (
        <div className="narrative-body">
            <div className="narrative-copy">
                <p>
                    Cuando una senal parece mejorar, la lectura debe explicar que
                    cambio, durante cuanto tiempo y bajo que condiciones.
                </p>
            </div>
            <div className="narrative-elements">
                <h3>Que hace confiable la lectura?</h3>
                <div className="narrative-list">
                    {elements.map(([heading, copy]) => (
                        <div key={heading}>
                            <strong>{heading}</strong>
                            <p>{copy}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
