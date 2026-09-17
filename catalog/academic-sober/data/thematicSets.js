import calendarCheckIcon from '@phosphor-icons/core/assets/bold/calendar-check-bold.svg?url';
import magnifyingGlassIcon from '@phosphor-icons/core/assets/bold/magnifying-glass-bold.svg?url';
import shieldCheckIcon from '@phosphor-icons/core/assets/bold/shield-check-bold.svg?url';
import targetIcon from '@phosphor-icons/core/assets/bold/target-bold.svg?url';
import trendUpIcon from '@phosphor-icons/core/assets/bold/trend-up-bold.svg?url';
import usersThreeIcon from '@phosphor-icons/core/assets/bold/users-three-bold.svg?url';

export const thematicSets = {
    two: [
        [
            'Acceso',
            magnifyingGlassIcon,
            'Identifica la barrera antes de proponer una respuesta.',
        ],
        [
            'Continuidad',
            calendarCheckIcon,
            'Mantiene el proceso disponible durante cada etapa.',
        ],
    ],
    three: [
        [
            'Observar',
            magnifyingGlassIcon,
            'Registra la evidencia antes de formular una conclusión.',
        ],
        [
            'Priorizar',
            targetIcon,
            'Elige una señal principal y conserva el contexto.',
        ],
        [
            'Verificar',
            shieldCheckIcon,
            'Hace trazable el resultado y sus límites.',
        ],
    ],
    four: [
        [
            'Dirección',
            targetIcon,
            'Define un objetivo compartido y verificable.',
        ],
        [
            'Evidencia',
            trendUpIcon,
            'Muestra solo el cambio que sostiene la conclusión.',
        ],
        [
            'Equipo',
            usersThreeIcon,
            'Asigna responsabilidades sin duplicar funciones.',
        ],
        [
            'Entrega',
            calendarCheckIcon,
            'Ordena el trabajo en hitos observables.',
        ],
    ],
};
