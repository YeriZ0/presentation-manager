export function HierarchyDiagram() {
    return (
        <figure
            className="diagram-body diagram-hierarchy"
            data-diagram
            data-diagram-type="hierarchy"
            data-reading-direction="top-to-bottom"
            aria-labelledby="hierarchy-diagram-title"
            aria-describedby="hierarchy-diagram-description"
        >
            <span id="hierarchy-diagram-title" className="visually-hidden">
                Jerarquía de un programa de investigación
            </span>
            <svg
                viewBox="0 0 1680 620"
                data-diagram-connectors
                aria-hidden="true"
            >
                <path
                    className="diagram-edge"
                    d="M 840 120 V 174 H 460 V 220"
                    data-diagram-edge="hierarchy-methods"
                    data-from="hierarchy-program"
                    data-to="hierarchy-methods"
                />
                <path
                    className="diagram-edge"
                    d="M 840 120 V 174 H 1220 V 220"
                    data-diagram-edge="hierarchy-results"
                    data-from="hierarchy-program"
                    data-to="hierarchy-results"
                />
                <path
                    className="diagram-edge"
                    d="M 460 330 V 386 H 195 V 440"
                    data-diagram-edge="hierarchy-qualitative"
                    data-from="hierarchy-methods"
                    data-to="hierarchy-qualitative"
                />
                <path
                    className="diagram-edge"
                    d="M 460 330 V 386 H 630 V 440"
                    data-diagram-edge="hierarchy-quantitative"
                    data-from="hierarchy-methods"
                    data-to="hierarchy-quantitative"
                />
                <path
                    className="diagram-edge"
                    d="M 1220 330 V 386 H 1050 V 440"
                    data-diagram-edge="hierarchy-evidence"
                    data-from="hierarchy-results"
                    data-to="hierarchy-evidence"
                />
                <path
                    className="diagram-edge"
                    d="M 1220 330 V 386 H 1485 V 440"
                    data-diagram-edge="hierarchy-transfer"
                    data-from="hierarchy-results"
                    data-to="hierarchy-transfer"
                />
            </svg>
            <article
                className="diagram-node diagram-node-emphasis hierarchy-program"
                data-diagram-node="hierarchy-program"
                data-diagram-root
            >
                <strong>Programa</strong>
                <small>Pregunta compartida</small>
            </article>
            <article
                className="diagram-node hierarchy-methods"
                data-diagram-node="hierarchy-methods"
            >
                <strong>Métodos</strong>
                <small>Cómo se estudia</small>
            </article>
            <article
                className="diagram-node hierarchy-results"
                data-diagram-node="hierarchy-results"
            >
                <strong>Resultados</strong>
                <small>Qué se obtiene</small>
            </article>
            <article
                className="diagram-node hierarchy-qualitative"
                data-diagram-node="hierarchy-qualitative"
            >
                <strong>Cualitativo</strong>
                <small>Experiencias</small>
            </article>
            <article
                className="diagram-node hierarchy-quantitative"
                data-diagram-node="hierarchy-quantitative"
            >
                <strong>Cuantitativo</strong>
                <small>Mediciones</small>
            </article>
            <article
                className="diagram-node hierarchy-evidence"
                data-diagram-node="hierarchy-evidence"
            >
                <strong>Evidencia</strong>
                <small>Hallazgos</small>
            </article>
            <article
                className="diagram-node hierarchy-transfer"
                data-diagram-node="hierarchy-transfer"
            >
                <strong>Transferencia</strong>
                <small>Aplicación</small>
            </article>
            <span
                className="diagram-label hierarchy-label-methods"
                data-diagram-label
                data-for-edge="hierarchy-methods"
            >
                organiza
            </span>
            <span
                className="diagram-label hierarchy-label-results"
                data-diagram-label
                data-for-edge="hierarchy-results"
            >
                produce
            </span>
            <span
                className="diagram-label hierarchy-label-qualitative"
                data-diagram-label
                data-for-edge="hierarchy-qualitative"
            >
                incluye
            </span>
            <span
                className="diagram-label hierarchy-label-quantitative"
                data-diagram-label
                data-for-edge="hierarchy-quantitative"
            >
                incluye
            </span>
            <span
                className="diagram-label hierarchy-label-evidence"
                data-diagram-label
                data-for-edge="hierarchy-evidence"
            >
                documenta
            </span>
            <span
                className="diagram-label hierarchy-label-transfer"
                data-diagram-label
                data-for-edge="hierarchy-transfer"
            >
                aplica
            </span>
            <figcaption
                id="hierarchy-diagram-description"
                className="visually-hidden"
            >
                El programa se divide en métodos y resultados. Métodos contiene
                enfoques cualitativo y cuantitativo; resultados contiene
                evidencia y transferencia.
            </figcaption>
        </figure>
    );
}
