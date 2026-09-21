export function normalizeIconSelection(rawIcons, catalog) {
    const safeName = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!Array.isArray(rawIcons))
        throw new Error('La selección de iconos debe ser una lista');
    const icons = rawIcons.map((icon) => {
        if (!icon || !safeName.test(icon.name ?? ''))
            throw new Error('Nombre de icono no válido');
        const name = Object.hasOwn(catalog.roles, icon.name)
            ? catalog.roles[icon.name]
            : icon.name;
        const role = icon.role || icon.name;
        const weight = icon.weight || 'regular';
        if (!safeName.test(name) || !safeName.test(role))
            throw new Error('Nombre o rol de icono no válido');
        if (
            !Object.values(catalog.roles).includes(name) &&
            icon.approved !== true
        ) {
            throw new Error(
                `El icono fuera del catálogo requiere approved: true: ${name}`,
            );
        }
        if (!catalog.weights.includes(weight))
            throw new Error(`Peso de icono no permitido: ${weight}`);
        return { role, name, weight };
    });
    const roles = new Map();
    for (const icon of icons) {
        if (roles.has(icon.role) && roles.get(icon.role) !== icon.name)
            throw new Error(`Rol de icono ambiguo: ${icon.role}`);
        roles.set(icon.role, icon.name);
    }
    return [
        ...new Map(
            icons.map((icon) => [
                `${icon.role}:${icon.name}:${icon.weight}`,
                icon,
            ]),
        ).values(),
    ];
}
