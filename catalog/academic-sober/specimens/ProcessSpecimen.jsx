const steps = [
    ['01', 'Definir', 'Delimitar la pregunta y la unidad de observacion.'],
    ['02', 'Probar', 'Contrastar la hipotesis con evidencia verificable.'],
    ['03', 'Medir', 'Comparar el resultado con una referencia estable.'],
    ['04', 'Ajustar', 'Registrar el cambio y repetir la comprobacion.'],
];

export function ProcessSpecimen() {
    return (
        <div className="process-body">
            {steps.map(([number, heading, copy], index) => (
                <div className="process-step" key={number}>
                    <span>{number}</span>
                    <h3>{heading}</h3>
                    <p>{copy}</p>
                    {index < steps.length - 1 && <i aria-hidden="true" />}
                </div>
            ))}
        </div>
    );
}
