export function createDonutGeometry(
    parts,
    { cx = 300, cy = 300, innerRadius = 88, outerRadius = 190 } = {},
) {
    if (
        !Array.isArray(parts) ||
        parts.length < 3 ||
        parts.length > 5 ||
        new Set(parts.map((part) => part.id)).size !== parts.length ||
        parts.some(
            (part) =>
                !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(part.id ?? '') ||
                typeof part.label !== 'string' ||
                !part.label.trim() ||
                !Number.isFinite(part.value) ||
                part.value <= 0,
        )
    ) {
        throw new Error(
            'La dona requiere de tres a cinco categorías positivas con IDs únicos y etiquetas',
        );
    }
    const total = parts.reduce((sum, part) => sum + part.value, 0);
    if (Math.abs(total - 100) > 0.001) {
        throw new Error('Los segmentos de la dona deben sumar 100');
    }
    if (
        ![cx, cy, innerRadius, outerRadius].every(Number.isFinite) ||
        innerRadius <= 0 ||
        outerRadius <= innerRadius
    ) {
        throw new Error('Centro o radios de dona inválidos');
    }
    const maximum = Math.max(...parts.map((part) => part.value));
    const point = (radius, angle) => {
        const radians = ((angle - 90) * Math.PI) / 180;
        return [
            cx + radius * Math.cos(radians),
            cy + radius * Math.sin(radians),
        ]
            .map((value) => Number(value.toFixed(6)))
            .join(' ');
    };
    let angle = 0;
    const segments = parts.map((part, index) => {
        const start = angle;
        angle =
            index === parts.length - 1
                ? 360
                : angle + (part.value / total) * 360;
        const largeArc = angle - start > 180 ? 1 : 0;
        return {
            ...part,
            highlighted: part.value === maximum,
            path: [
                `M ${point(outerRadius, start)}`,
                `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${point(outerRadius, angle)}`,
                `L ${point(innerRadius, angle)}`,
                `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${point(innerRadius, start)}`,
                'Z',
            ].join(' '),
        };
    });
    return {
        cx,
        cy,
        innerRadius,
        outerRadius,
        segments,
        maxima: segments.filter((segment) => segment.highlighted),
    };
}
