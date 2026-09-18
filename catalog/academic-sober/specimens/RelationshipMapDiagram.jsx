export function RelationshipMapDiagram() {
    return (
        <figure
            className="diagram-body diagram-relationship-map"
            data-diagram
            data-diagram-type="relationship-map"
            data-reading-direction="radial"
            aria-labelledby="relationship-map-title"
            aria-describedby="relationship-map-description"
        >
            <span id="relationship-map-title" className="visually-hidden">
                Mapa relacional de permanencia estudiantil
            </span>
            <svg
                viewBox="0 0 1680 620"
                data-diagram-connectors
                aria-hidden="true"
            >
                <path
                    className="diagram-edge"
                    d="M 700 310 L 280 118"
                    data-diagram-edge="relationship-support"
                    data-from="relationship-center"
                    data-to="relationship-support"
                />
                <path
                    className="diagram-edge"
                    d="M 700 350 L 280 510"
                    data-diagram-edge="relationship-finance"
                    data-from="relationship-center"
                    data-to="relationship-finance"
                />
                <path
                    className="diagram-edge"
                    d="M 840 230 V 120"
                    data-diagram-edge="relationship-learning"
                    data-from="relationship-center"
                    data-to="relationship-learning"
                />
                <path
                    className="diagram-edge"
                    d="M 980 310 L 1400 118"
                    data-diagram-edge="relationship-community"
                    data-from="relationship-center"
                    data-to="relationship-community"
                />
                <path
                    className="diagram-edge"
                    d="M 980 350 L 1400 510"
                    data-diagram-edge="relationship-wellbeing"
                    data-from="relationship-center"
                    data-to="relationship-wellbeing"
                />
            </svg>
            <article
                className="diagram-node diagram-node-emphasis relationship-center"
                data-diagram-node="relationship-center"
                data-diagram-center
            >
                <strong>Permanencia</strong>
                <small>Continuidad estudiantil</small>
            </article>
            <article
                className="diagram-node relationship-support"
                data-diagram-node="relationship-support"
            >
                <strong>Acompañamiento</strong>
                <small>Orientación oportuna</small>
            </article>
            <article
                className="diagram-node relationship-finance"
                data-diagram-node="relationship-finance"
            >
                <strong>Recursos</strong>
                <small>Apoyo disponible</small>
            </article>
            <article
                className="diagram-node relationship-learning"
                data-diagram-node="relationship-learning"
            >
                <strong>Aprendizaje</strong>
                <small>Progreso observable</small>
            </article>
            <article
                className="diagram-node relationship-community"
                data-diagram-node="relationship-community"
            >
                <strong>Comunidad</strong>
                <small>Vínculos significativos</small>
            </article>
            <article
                className="diagram-node relationship-wellbeing"
                data-diagram-node="relationship-wellbeing"
            >
                <strong>Bienestar</strong>
                <small>Condiciones sostenibles</small>
            </article>
            <span
                className="diagram-label relationship-label-support"
                data-diagram-label
                data-for-edge="relationship-support"
            >
                orienta
            </span>
            <span
                className="diagram-label relationship-label-finance"
                data-diagram-label
                data-for-edge="relationship-finance"
            >
                sostiene
            </span>
            <span
                className="diagram-label relationship-label-learning"
                data-diagram-label
                data-for-edge="relationship-learning"
            >
                demuestra avance
            </span>
            <span
                className="diagram-label relationship-label-community"
                data-diagram-label
                data-for-edge="relationship-community"
            >
                integra
            </span>
            <span
                className="diagram-label relationship-label-wellbeing"
                data-diagram-label
                data-for-edge="relationship-wellbeing"
            >
                equilibra
            </span>
            <figcaption
                id="relationship-map-description"
                className="visually-hidden"
            >
                La permanencia estudiantil se relaciona directamente con el
                acompañamiento, los recursos, el aprendizaje, la comunidad y el
                bienestar.
            </figcaption>
        </figure>
    );
}
