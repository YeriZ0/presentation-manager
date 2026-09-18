export function SequenceDiagram() {
    return (
        <figure
            className="diagram-body diagram-sequence"
            data-diagram
            data-diagram-type="sequence"
            data-reading-direction="top-to-bottom"
            aria-labelledby="sequence-diagram-title"
            aria-describedby="sequence-diagram-description"
        >
            <span id="sequence-diagram-title" className="visually-hidden">
                Secuencia de consulta de resultados
            </span>
            <svg
                viewBox="0 0 1680 620"
                data-diagram-connectors
                aria-hidden="true"
            >
                <defs>
                    <marker
                        id="sequence-arrow"
                        markerWidth="7.2"
                        markerHeight="7.2"
                        refX="7.2"
                        refY="3.6"
                        orient="auto"
                    >
                        <path d="M 0 0 L 7.2 3.6 L 0 7.2 z" />
                    </marker>
                </defs>
                <path className="diagram-lifeline" d="M 130 126 V 590" />
                <path className="diagram-lifeline" d="M 603 126 V 590" />
                <path className="diagram-lifeline" d="M 1077 126 V 590" />
                <path className="diagram-lifeline" d="M 1550 126 V 590" />
                <path
                    className="diagram-edge diagram-edge-primary"
                    d="M 130 200 H 603"
                    markerEnd="url(#sequence-arrow)"
                    data-diagram-edge="sequence-open"
                    data-diagram-message
                    data-from="sequence-student"
                    data-to="sequence-portal"
                />
                <path
                    className="diagram-edge diagram-edge-primary"
                    d="M 603 274 H 1077"
                    markerEnd="url(#sequence-arrow)"
                    data-diagram-edge="sequence-request"
                    data-diagram-message
                    data-from="sequence-portal"
                    data-to="sequence-api"
                />
                <path
                    className="diagram-edge diagram-edge-primary"
                    d="M 1077 348 H 1550"
                    markerEnd="url(#sequence-arrow)"
                    data-diagram-edge="sequence-query"
                    data-diagram-message
                    data-from="sequence-api"
                    data-to="sequence-data"
                />
                <path
                    className="diagram-edge diagram-edge-return"
                    d="M 1550 422 H 1077"
                    markerEnd="url(#sequence-arrow)"
                    data-diagram-edge="sequence-records"
                    data-diagram-message
                    data-from="sequence-data"
                    data-to="sequence-api"
                />
                <path
                    className="diagram-edge diagram-edge-return"
                    d="M 1077 496 H 603"
                    markerEnd="url(#sequence-arrow)"
                    data-diagram-edge="sequence-response"
                    data-diagram-message
                    data-from="sequence-api"
                    data-to="sequence-portal"
                />
                <path
                    className="diagram-edge diagram-edge-return"
                    d="M 603 560 H 130"
                    markerEnd="url(#sequence-arrow)"
                    data-diagram-edge="sequence-render"
                    data-diagram-message
                    data-from="sequence-portal"
                    data-to="sequence-student"
                />
            </svg>
            <article
                className="diagram-node sequence-student"
                data-diagram-node="sequence-student"
                data-diagram-participant
            >
                <strong>Estudiante</strong>
                <small>Sesión activa</small>
            </article>
            <article
                className="diagram-node sequence-portal"
                data-diagram-node="sequence-portal"
                data-diagram-participant
            >
                <strong>Portal</strong>
                <small>Interfaz web</small>
            </article>
            <article
                className="diagram-node sequence-api"
                data-diagram-node="sequence-api"
                data-diagram-participant
            >
                <strong>API</strong>
                <small>Consulta autorizada</small>
            </article>
            <article
                className="diagram-node sequence-data"
                data-diagram-node="sequence-data"
                data-diagram-participant
            >
                <strong>Repositorio</strong>
                <small>Fuente oficial</small>
            </article>
            <span
                className="diagram-label diagram-label-primary sequence-label-open"
                data-diagram-label
                data-for-edge="sequence-open"
            >
                abre resultados
            </span>
            <span
                className="diagram-label diagram-label-primary sequence-label-request"
                data-diagram-label
                data-for-edge="sequence-request"
            >
                GET /resultados
            </span>
            <span
                className="diagram-label diagram-label-primary sequence-label-query"
                data-diagram-label
                data-for-edge="sequence-query"
            >
                consulta vigente
            </span>
            <span
                className="diagram-label sequence-label-records"
                data-diagram-label
                data-for-edge="sequence-records"
            >
                registros
            </span>
            <span
                className="diagram-label sequence-label-response"
                data-diagram-label
                data-for-edge="sequence-response"
            >
                200 JSON
            </span>
            <span
                className="diagram-label sequence-label-render"
                data-diagram-label
                data-for-edge="sequence-render"
            >
                presenta
            </span>
            <figcaption
                id="sequence-diagram-description"
                className="visually-hidden"
            >
                El estudiante abre el portal, que consulta la API. La API lee el
                repositorio y devuelve los resultados para presentarlos.
            </figcaption>
        </figure>
    );
}
