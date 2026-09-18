export function SystemDiagram() {
    return (
        <figure
            className="diagram-body diagram-architecture"
            data-diagram
            data-diagram-type="architecture"
            data-reading-direction="left-to-right"
            aria-labelledby="architecture-diagram-title"
            aria-describedby="architecture-diagram-description"
        >
            <span id="architecture-diagram-title" className="visually-hidden">
                Arquitectura de validación y auditoría
            </span>
            <svg
                viewBox="0 0 1680 620"
                data-diagram-connectors
                aria-hidden="true"
            >
                <defs>
                    <marker
                        id="architecture-arrow"
                        markerWidth="7.2"
                        markerHeight="7.2"
                        refX="7.2"
                        refY="3.6"
                        orient="auto"
                    >
                        <path d="M 0 0 L 7.2 3.6 L 0 7.2 z" />
                    </marker>
                </defs>
                <path
                    className="diagram-edge diagram-edge-primary"
                    d="M 540 168 H 686"
                    markerEnd="url(#architecture-arrow)"
                    data-diagram-edge="architecture-validate"
                    data-from="architecture-input"
                    data-to="architecture-process"
                />
                <path
                    className="diagram-edge diagram-edge-primary"
                    d="M 990 168 H 1136"
                    markerEnd="url(#architecture-arrow)"
                    data-diagram-edge="architecture-publish"
                    data-from="architecture-process"
                    data-to="architecture-result"
                />
                <path
                    className="diagram-edge diagram-edge-secondary"
                    d="M 840 256 V 402"
                    markerEnd="url(#architecture-arrow)"
                    data-diagram-edge="architecture-audit"
                    data-from="architecture-process"
                    data-to="architecture-audit"
                />
            </svg>
            <article
                className="diagram-node architecture-input"
                data-diagram-node="architecture-input"
            >
                <span>01</span>
                <strong>Entrada</strong>
                <small>Datos verificados</small>
            </article>
            <article
                className="diagram-node diagram-node-emphasis architecture-process"
                data-diagram-node="architecture-process"
            >
                <span>02</span>
                <strong>Procesamiento</strong>
                <small>Reglas declaradas</small>
            </article>
            <article
                className="diagram-node architecture-result"
                data-diagram-node="architecture-result"
            >
                <span>03</span>
                <strong>Resultado</strong>
                <small>Salida trazable</small>
            </article>
            <article
                className="diagram-node architecture-audit"
                data-diagram-node="architecture-audit"
            >
                <span>04</span>
                <strong>Auditoría</strong>
                <small>Registro y control</small>
            </article>
            <span
                className="diagram-label diagram-label-primary architecture-label-validate"
                data-diagram-label
                data-for-edge="architecture-validate"
            >
                valida
            </span>
            <span
                className="diagram-label diagram-label-primary architecture-label-publish"
                data-diagram-label
                data-for-edge="architecture-publish"
            >
                publica
            </span>
            <span
                className="diagram-label architecture-label-audit"
                data-diagram-label
                data-for-edge="architecture-audit"
            >
                registra
            </span>
            <figcaption
                id="architecture-diagram-description"
                className="visually-hidden"
            >
                La entrada pasa al procesamiento, que publica un resultado y
                envía un registro secundario a auditoría.
            </figcaption>
        </figure>
    );
}
