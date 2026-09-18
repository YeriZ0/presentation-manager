export function WorkflowDiagram() {
    return (
        <figure
            className="diagram-body diagram-workflow"
            data-diagram
            data-diagram-type="workflow"
            data-reading-direction="left-to-right"
            aria-labelledby="workflow-diagram-title"
            aria-describedby="workflow-diagram-description"
        >
            <span id="workflow-diagram-title" className="visually-hidden">
                Workflow de revisión académica
            </span>
            <svg
                viewBox="0 0 1680 620"
                data-diagram-connectors
                aria-hidden="true"
            >
                <defs>
                    <marker
                        id="workflow-arrow"
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
                    d="M 390 152 H 460 V 292 H 526"
                    markerEnd="url(#workflow-arrow)"
                    data-diagram-edge="workflow-submit"
                    data-from="workflow-request"
                    data-to="workflow-review"
                />
                <path
                    className="diagram-edge diagram-edge-primary"
                    d="M 770 292 H 840 V 152 H 906"
                    markerEnd="url(#workflow-arrow)"
                    data-diagram-edge="workflow-evaluate"
                    data-from="workflow-review"
                    data-to="workflow-decision"
                />
                <path
                    className="diagram-edge diagram-edge-primary"
                    d="M 1150 152 H 1220 V 292 H 1286"
                    markerEnd="url(#workflow-arrow)"
                    data-diagram-edge="workflow-approve"
                    data-from="workflow-decision"
                    data-to="workflow-approved"
                />
                <path
                    className="diagram-edge diagram-edge-secondary"
                    d="M 1030 244 H 934 V 424"
                    markerEnd="url(#workflow-arrow)"
                    data-diagram-edge="workflow-return"
                    data-from="workflow-decision"
                    data-to="workflow-revision"
                />
                <path
                    className="diagram-edge diagram-edge-secondary"
                    d="M 822 520 H 796 V 292 H 774"
                    markerEnd="url(#workflow-arrow)"
                    data-diagram-edge="workflow-resubmit"
                    data-from="workflow-revision"
                    data-to="workflow-review"
                />
            </svg>
            <article
                className="diagram-node workflow-request"
                data-diagram-node="workflow-request"
            >
                <span>01</span>
                <strong>Solicitud</strong>
                <small>Entrega registrada</small>
            </article>
            <article
                className="diagram-node workflow-review"
                data-diagram-node="workflow-review"
            >
                <span>02</span>
                <strong>Revisión</strong>
                <small>Criterios comunes</small>
            </article>
            <article
                className="diagram-node diagram-decision workflow-decision"
                data-diagram-node="workflow-decision"
                data-diagram-decision
            >
                <span>03</span>
                <strong>Decisión</strong>
                <small>Evidencia suficiente</small>
            </article>
            <article
                className="diagram-node workflow-approved"
                data-diagram-node="workflow-approved"
            >
                <span>04</span>
                <strong>Aprobación</strong>
                <small>Resultado comunicado</small>
            </article>
            <article
                className="diagram-node workflow-revision"
                data-diagram-node="workflow-revision"
            >
                <span>R</span>
                <strong>Ajustes</strong>
                <small>Observaciones concretas</small>
            </article>
            <span
                className="diagram-label diagram-label-primary workflow-label-submit"
                data-diagram-label
                data-for-edge="workflow-submit"
            >
                envía
            </span>
            <span
                className="diagram-label diagram-label-primary workflow-label-evaluate"
                data-diagram-label
                data-for-edge="workflow-evaluate"
            >
                evalúa
            </span>
            <span
                className="diagram-label diagram-label-primary workflow-label-approve"
                data-diagram-label
                data-for-edge="workflow-approve"
            >
                cumple
            </span>
            <span
                className="diagram-label workflow-label-return"
                data-diagram-label
                data-for-edge="workflow-return"
            >
                requiere ajustes
            </span>
            <span
                className="diagram-label workflow-label-resubmit"
                data-diagram-label
                data-for-edge="workflow-resubmit"
            >
                reingresa
            </span>
            <figcaption
                id="workflow-diagram-description"
                className="visually-hidden"
            >
                La solicitud se revisa y decide. Si cumple se aprueba; si no,
                vuelve a ajustes y reingresa a revisión.
            </figcaption>
        </figure>
    );
}
