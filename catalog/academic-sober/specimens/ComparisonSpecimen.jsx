import shareNetworkIcon from '@phosphor-icons/core/assets/bold/share-network-bold.svg?url';
import shieldCheckIcon from '@phosphor-icons/core/assets/bold/shield-check-bold.svg?url';

const options = [
    {
        title: 'Control local',
        icon: shieldCheckIcon,
        description: 'Mayor autonomía operativa con una escala limitada.',
    },
    {
        title: 'Modelo híbrido',
        icon: shareNetworkIcon,
        description: 'Equilibra control, escala y capacidad de adaptación.',
    },
];

export function ComparisonSpecimen() {
    return (
        <div className="comparison-body" data-comparison>
            {options.map(({ title, icon, description }) => (
                <article data-comparison-option key={title}>
                    <h3 data-unit-topic>{title}</h3>
                    <img
                        className="deck-icon"
                        src={icon}
                        alt=""
                        aria-hidden="true"
                    />
                    <p data-unit-description>{description}</p>
                </article>
            ))}
            <span className="comparison-connector" data-comparison-connector>
                Frente a
            </span>
        </div>
    );
}
