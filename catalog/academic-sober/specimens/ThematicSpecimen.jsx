import { thematicSets } from '../data/thematicSets.js';

export function ThematicSpecimen({ set }) {
    const units = thematicSets[set];

    return (
        <div className="thematic-body" data-count={units.length}>
            {units.map(([heading, icon, copy]) => (
                <article data-thematic-unit key={heading}>
                    <h3 data-unit-topic>{heading}</h3>
                    <img
                        className="deck-icon"
                        src={icon}
                        alt=""
                        aria-hidden="true"
                    />
                    <p data-unit-description>{copy}</p>
                </article>
            ))}
        </div>
    );
}
