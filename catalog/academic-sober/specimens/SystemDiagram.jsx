export function SystemDiagram() {
    return (
        <figure
            className="diagram-body"
            data-diagram
            data-reading-direction="left-to-right"
            aria-labelledby="system-diagram-title"
            aria-describedby="system-diagram-description"
        >
            <span id="system-diagram-title" className="visually-hidden">
                Flujo de validacion y auditoria
            </span>
            <svg
                viewBox="0 0 1720 665"
                data-diagram-connectors
                aria-hidden="true"
            >
                <defs>
                    <marker
                        id="catalog-arrow"
                        markerWidth="12"
                        markerHeight="12"
                        refX="10"
                        refY="6"
                        orient="auto"
                    >
                        <path d="M 0 0 L 12 6 L 0 12 z" />
                    </marker>
                </defs>
                <path
                    d="M 300 126 H 710"
                    markerEnd="url(#catalog-arrow)"
                />
                <path
                    d="M 1010 126 H 1420"
                    markerEnd="url(#catalog-arrow)"
                />
                <path
                    d="M 860 210 V 590 H 1420"
                    markerEnd="url(#catalog-arrow)"
                />
            </svg>
            <div className="diagram-node diagram-source" data-diagram-node>
                <span>01</span>
                <strong>Entrada</strong>
                <small>Datos verificados</small>
            </div>
            <div className="diagram-node diagram-core" data-diagram-node>
                <span>02</span>
                <strong>Procesamiento</strong>
                <small>Reglas declaradas</small>
            </div>
            <div className="diagram-node diagram-output" data-diagram-node>
                <span>03</span>
                <strong>Resultado</strong>
                <small>Salida trazable</small>
            </div>
            <div className="diagram-node diagram-audit" data-diagram-node>
                <span>04</span>
                <strong>Auditoria</strong>
                <small>Registro y control</small>
            </div>
            <figcaption
                id="system-diagram-description"
                className="visually-hidden"
            >
                La entrada verificada pasa al procesamiento. El procesamiento
                produce un resultado trazable y envia un registro paralelo a
                auditoria.
            </figcaption>
        </figure>
    );
}
