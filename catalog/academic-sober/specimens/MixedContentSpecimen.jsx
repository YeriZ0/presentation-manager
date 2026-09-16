export function MixedContentSpecimen() {
    return (
        <div className="mixed-body">
            <div className="mixed-visual" role="img" aria-label="Diagrama de tres fuentes que convergen en una salida">
                <span>Fuente A</span>
                <span>Fuente B</span>
                <span>Fuente C</span>
                <b aria-hidden="true" />
                <strong>Salida</strong>
            </div>
            <div className="mixed-copy">
                <p className="mixed-lead">
                    La consistencia temprana evita correcciones costosas al final
                    del proceso.
                </p>
                <ul>
                    <li>Un criterio compartido</li>
                    <li>Una fuente verificable</li>
                    <li>Una salida comparable</li>
                </ul>
            </div>
        </div>
    );
}
