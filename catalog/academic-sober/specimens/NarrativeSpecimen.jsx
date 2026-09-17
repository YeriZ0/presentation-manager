import clockIcon from '@phosphor-icons/core/assets/bold/clock-bold.svg?url';
import sealCheckIcon from '@phosphor-icons/core/assets/bold/seal-check-bold.svg?url';
import usersIcon from '@phosphor-icons/core/assets/bold/users-bold.svg?url';

const elements = [
    [
        'Calidad',
        sealCheckIcon,
        'Los registros mantienen una fuente identificable.',
    ],
    [
        'Tiempo',
        clockIcon,
        'Las decisiones se comparan dentro del mismo período.',
    ],
    ['Alcance', usersIcon, 'La conclusión declara a quién representa el dato.'],
];

export function NarrativeSpecimen() {
    return (
        <div className="narrative-body" data-narrative>
            <div className="narrative-copy" data-narrative-copy>
                <p>
                    Cuando una señal parece mejorar, la lectura debe explicar
                    qué cambió, durante cuánto tiempo y bajo qué condiciones.
                </p>
            </div>
            <div className="narrative-elements" data-narrative-elements>
                <div className="narrative-list">
                    {elements.map(([heading, icon, copy]) => (
                        <article data-narrative-element key={heading}>
                            <h3 data-element-topic>{heading}</h3>
                            <img
                                className="deck-icon"
                                src={icon}
                                alt=""
                                aria-hidden="true"
                            />
                            <p data-element-description>{copy}</p>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
}
