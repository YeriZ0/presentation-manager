export function LifecycleDiagram() {
    return (
        <figure
            className="diagram-body diagram-lifecycle"
            data-diagram
            data-diagram-type="lifecycle"
            data-reading-direction="left-to-right"
            aria-labelledby="lifecycle-diagram-title"
            aria-describedby="lifecycle-diagram-description"
        >
            <span id="lifecycle-diagram-title" className="visually-hidden">
                Ciclo de vida de un manuscrito
            </span>
            <svg
                viewBox="0 0 1680 620"
                data-diagram-connectors
                aria-hidden="true"
            >
                <defs>
                    <marker
                        id="lifecycle-arrow"
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
                    d="M 250 180 H 351"
                    markerEnd="url(#lifecycle-arrow)"
                    data-diagram-edge="lifecycle-submit"
                    data-from="lifecycle-draft"
                    data-to="lifecycle-review"
                />
                <path
                    className="diagram-edge diagram-edge-primary"
                    d="M 605 180 H 706"
                    markerEnd="url(#lifecycle-arrow)"
                    data-diagram-edge="lifecycle-approve"
                    data-from="lifecycle-review"
                    data-to="lifecycle-approved"
                />
                <path
                    className="diagram-edge diagram-edge-primary"
                    d="M 960 180 H 1061"
                    markerEnd="url(#lifecycle-arrow)"
                    data-diagram-edge="lifecycle-publish"
                    data-from="lifecycle-approved"
                    data-to="lifecycle-published"
                />
                <path
                    className="diagram-edge diagram-edge-secondary"
                    d="M 480 268 V 330 H 835 V 364"
                    markerEnd="url(#lifecycle-arrow)"
                    data-diagram-edge="lifecycle-correct"
                    data-from="lifecycle-review"
                    data-to="lifecycle-revision"
                />
                <path
                    className="diagram-edge diagram-edge-secondary"
                    d="M 710 474 H 300 V 180 H 351"
                    markerEnd="url(#lifecycle-arrow)"
                    data-diagram-edge="lifecycle-resubmit"
                    data-from="lifecycle-revision"
                    data-to="lifecycle-review"
                />
                <path
                    className="diagram-edge diagram-edge-return"
                    d="M 1315 180 H 1416"
                    markerEnd="url(#lifecycle-arrow)"
                    data-diagram-edge="lifecycle-archive"
                    data-from="lifecycle-published"
                    data-to="lifecycle-archived"
                />
            </svg>
            <article
                className="diagram-node lifecycle-draft"
                data-diagram-node="lifecycle-draft"
                data-diagram-state
            >
                <span>01</span>
                <strong>Borrador</strong>
                <small>Trabajo abierto</small>
            </article>
            <article
                className="diagram-node lifecycle-review"
                data-diagram-node="lifecycle-review"
                data-diagram-state
            >
                <span>02</span>
                <strong>En revisión</strong>
                <small>Evaluación activa</small>
            </article>
            <article
                className="diagram-node lifecycle-approved"
                data-diagram-node="lifecycle-approved"
                data-diagram-state
            >
                <span>03</span>
                <strong>Aprobado</strong>
                <small>Versión aceptada</small>
            </article>
            <article
                className="diagram-node diagram-node-emphasis lifecycle-published"
                data-diagram-node="lifecycle-published"
                data-diagram-state
            >
                <span>04</span>
                <strong>Publicado</strong>
                <small>Resultado visible</small>
            </article>
            <article
                className="diagram-node lifecycle-archived"
                data-diagram-node="lifecycle-archived"
                data-diagram-state
            >
                <span>05</span>
                <strong>Archivado</strong>
                <small>Estado terminal</small>
            </article>
            <article
                className="diagram-node lifecycle-revision"
                data-diagram-node="lifecycle-revision"
                data-diagram-state
            >
                <span>R</span>
                <strong>En ajustes</strong>
                <small>Cambios solicitados</small>
            </article>
            <span
                className="diagram-label diagram-label-primary lifecycle-label-submit"
                data-diagram-label
                data-for-edge="lifecycle-submit"
            >
                enviar
            </span>
            <span
                className="diagram-label diagram-label-primary lifecycle-label-approve"
                data-diagram-label
                data-for-edge="lifecycle-approve"
            >
                aceptar
            </span>
            <span
                className="diagram-label diagram-label-primary lifecycle-label-publish"
                data-diagram-label
                data-for-edge="lifecycle-publish"
            >
                publicar
            </span>
            <span
                className="diagram-label lifecycle-label-correct"
                data-diagram-label
                data-for-edge="lifecycle-correct"
            >
                corregir
            </span>
            <span
                className="diagram-label lifecycle-label-resubmit"
                data-diagram-label
                data-for-edge="lifecycle-resubmit"
            >
                reenviar
            </span>
            <span
                className="diagram-label lifecycle-label-archive"
                data-diagram-label
                data-for-edge="lifecycle-archive"
            >
                cerrar
            </span>
            <figcaption
                id="lifecycle-diagram-description"
                className="visually-hidden"
            >
                El manuscrito pasa de borrador a revisión. Puede volver a
                ajustes o continuar hasta aprobado, publicado y archivado.
            </figcaption>
        </figure>
    );
}
