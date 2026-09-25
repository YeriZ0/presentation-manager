const generatedSvgs = import.meta.glob('../generated/*.svg', {
    eager: true,
    import: 'default',
    query: '?raw',
});

function generatedSvg(name) {
    return generatedSvgs[`../generated/${name}.svg`] || '';
}

const diagrams = {
    architecture: {
        direction: 'left-to-right',
        title: 'Arquitectura de validación y auditoría',
        description:
            'La entrada pasa al procesamiento, que publica un resultado y envía un registro secundario a auditoría.',
        svg: generatedSvg('architecture'),
    },
    workflow: {
        direction: 'left-to-right',
        title: 'Workflow de revisión académica',
        description:
            'La solicitud se revisa y decide. Si cumple se aprueba; si no, vuelve a ajustes y reingresa a revisión.',
        svg: generatedSvg('workflow'),
    },
    sequence: {
        direction: 'top-to-bottom',
        title: 'Secuencia de consulta de resultados',
        description:
            'El estudiante consulta al portal, que solicita los resultados a la API y al repositorio antes de presentarlos.',
        svg: generatedSvg('sequence'),
    },
    'data-flow': {
        direction: 'left-to-right',
        title: 'Flujo de evidencia desde la captura hasta el informe',
        description:
            'Las respuestas se registran, normalizan, conservan y resumen en un informe trazable.',
        svg: generatedSvg('data-flow'),
    },
    lifecycle: {
        direction: 'left-to-right',
        title: 'Ciclo de vida de un manuscrito',
        description:
            'El manuscrito puede volver a ajustes antes de aprobarse, publicarse y archivarse.',
        svg: generatedSvg('lifecycle'),
    },
    hierarchy: {
        direction: 'top-to-bottom',
        title: 'Jerarquía de un programa de investigación',
        description:
            'El programa organiza métodos cualitativos y cuantitativos y produce resultados de evidencia y transferencia.',
        svg: generatedSvg('hierarchy'),
    },
    'relationship-map': {
        direction: 'radial',
        title: 'Mapa relacional de permanencia estudiantil',
        description:
            'La permanencia se relaciona con acompañamiento, recursos, aprendizaje, comunidad y bienestar.',
        svg: generatedSvg('relationship-map'),
    },
};

export function CompiledMermaidDiagram({ type }) {
    const diagram = diagrams[type];
    const titleId = `${type}-diagram-title`;
    const descriptionId = `${type}-diagram-description`;

    return (
        <figure
            className={`diagram-body diagram-${type}`}
            data-diagram
            data-diagram-engine="mermaid"
            data-diagram-type={type}
            data-reading-direction={diagram.direction}
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
        >
            <span id={titleId} className="visually-hidden">
                {diagram.title}
            </span>
            {diagram.svg ? (
                <div
                    data-diagram-output
                    dangerouslySetInnerHTML={{ __html: diagram.svg }}
                />
            ) : (
                <div data-diagram-output data-diagram-status="pending">
                    SVG pendiente de compilación
                </div>
            )}
            <figcaption id={descriptionId} className="diagram-caption">
                {diagram.description}
            </figcaption>
        </figure>
    );
}
