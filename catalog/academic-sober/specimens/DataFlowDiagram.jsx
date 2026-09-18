export function DataFlowDiagram() {
    return (
        <figure
            className="diagram-body diagram-data-flow"
            data-diagram
            data-diagram-type="data-flow"
            data-reading-direction="left-to-right"
            aria-labelledby="data-flow-diagram-title"
            aria-describedby="data-flow-diagram-description"
        >
            <span id="data-flow-diagram-title" className="visually-hidden">
                Flujo de evidencia desde la captura hasta el informe
            </span>
            <svg
                viewBox="0 0 1680 620"
                data-diagram-connectors
                aria-hidden="true"
            >
                <defs>
                    <marker
                        id="data-flow-arrow"
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
                    d="M 320 318 H 396"
                    markerEnd="url(#data-flow-arrow)"
                    data-diagram-edge="data-flow-forms"
                    data-from="data-flow-source"
                    data-to="data-flow-capture"
                />
                <path
                    className="diagram-edge diagram-edge-primary"
                    d="M 640 318 H 716"
                    markerEnd="url(#data-flow-arrow)"
                    data-diagram-edge="data-flow-records"
                    data-from="data-flow-capture"
                    data-to="data-flow-transform"
                />
                <path
                    className="diagram-edge diagram-edge-primary"
                    d="M 960 318 H 1036"
                    markerEnd="url(#data-flow-arrow)"
                    data-diagram-edge="data-flow-clean"
                    data-from="data-flow-transform"
                    data-to="data-flow-store"
                />
                <path
                    className="diagram-edge diagram-edge-primary"
                    d="M 1280 318 H 1356"
                    markerEnd="url(#data-flow-arrow)"
                    data-diagram-edge="data-flow-summary"
                    data-from="data-flow-store"
                    data-to="data-flow-report"
                />
            </svg>
            <span
                className="diagram-stage data-flow-stage-source"
                data-diagram-stage
            >
                Origen
            </span>
            <span
                className="diagram-stage data-flow-stage-capture"
                data-diagram-stage
            >
                Captura
            </span>
            <span
                className="diagram-stage data-flow-stage-process"
                data-diagram-stage
            >
                Transformación
            </span>
            <span
                className="diagram-stage data-flow-stage-store"
                data-diagram-stage
            >
                Conserva
            </span>
            <span
                className="diagram-stage data-flow-stage-use"
                data-diagram-stage
            >
                Comunica
            </span>
            <article
                className="diagram-node data-flow-source"
                data-diagram-node="data-flow-source"
            >
                <span>01</span>
                <strong>Encuestas</strong>
                <small>Respuestas originales</small>
            </article>
            <article
                className="diagram-node data-flow-capture"
                data-diagram-node="data-flow-capture"
            >
                <span>02</span>
                <strong>Registro</strong>
                <small>Campos validados</small>
            </article>
            <article
                className="diagram-node diagram-node-emphasis data-flow-transform"
                data-diagram-node="data-flow-transform"
            >
                <span>03</span>
                <strong>Normalización</strong>
                <small>Criterios declarados</small>
            </article>
            <article
                className="diagram-node data-flow-store"
                data-diagram-node="data-flow-store"
            >
                <span>04</span>
                <strong>Repositorio</strong>
                <small>Versión trazable</small>
            </article>
            <article
                className="diagram-node data-flow-report"
                data-diagram-node="data-flow-report"
            >
                <span>05</span>
                <strong>Informe</strong>
                <small>Hallazgos revisados</small>
            </article>
            <span
                className="diagram-label diagram-label-primary data-flow-label-forms"
                data-diagram-label
                data-for-edge="data-flow-forms"
            >
                formularios
            </span>
            <span
                className="diagram-label diagram-label-primary data-flow-label-records"
                data-diagram-label
                data-for-edge="data-flow-records"
            >
                registros
            </span>
            <span
                className="diagram-label diagram-label-primary data-flow-label-clean"
                data-diagram-label
                data-for-edge="data-flow-clean"
            >
                datos limpios
            </span>
            <span
                className="diagram-label diagram-label-primary data-flow-label-summary"
                data-diagram-label
                data-for-edge="data-flow-summary"
            >
                resumen
            </span>
            <figcaption
                id="data-flow-diagram-description"
                className="visually-hidden"
            >
                Las respuestas se capturan, normalizan y conservan en un
                repositorio antes de producir el informe.
            </figcaption>
        </figure>
    );
}
