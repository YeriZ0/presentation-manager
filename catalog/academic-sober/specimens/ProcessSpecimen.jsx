import arrowFatRightIcon from '@phosphor-icons/core/assets/bold/arrow-fat-right-bold.svg?url';
import chartLineIcon from '@phosphor-icons/core/assets/bold/chart-line-bold.svg?url';
import checkCircleIcon from '@phosphor-icons/core/assets/bold/check-circle-bold.svg?url';
import gearIcon from '@phosphor-icons/core/assets/bold/gear-bold.svg?url';
import targetIcon from '@phosphor-icons/core/assets/bold/target-bold.svg?url';

const steps = [
    [
        '01',
        'Definir',
        targetIcon,
        'Delimitar la pregunta y la unidad de observación.',
    ],
    [
        '02',
        'Probar',
        checkCircleIcon,
        'Contrastar la hipótesis con evidencia verificable.',
    ],
    [
        '03',
        'Medir',
        chartLineIcon,
        'Comparar el resultado con una referencia estable.',
    ],
    [
        '04',
        'Ajustar',
        gearIcon,
        'Registrar el cambio y repetir la comprobación.',
    ],
];

export function ProcessSpecimen() {
    return (
        <div className="process-body" data-process>
            <div
                className="process-connectors"
                aria-hidden="true"
                data-process-connectors
            >
                {[1, 2, 3].map((arrow) => (
                    <img
                        className={`deck-icon process-arrow process-arrow-${arrow}`}
                        src={arrowFatRightIcon}
                        alt=""
                        data-process-arrow="arrow-fat-right"
                        key={arrow}
                    />
                ))}
            </div>
            <ol>
                {steps.map(([number, heading, icon, copy]) => (
                    <li className="process-step" data-process-step key={number}>
                        <span className="process-number" data-step-number>
                            {number}
                        </span>
                        <h3 data-step-title>{heading}</h3>
                        <img
                            className="deck-icon"
                            src={icon}
                            alt=""
                            aria-hidden="true"
                        />
                        <p data-step-description>{copy}</p>
                    </li>
                ))}
            </ol>
        </div>
    );
}
