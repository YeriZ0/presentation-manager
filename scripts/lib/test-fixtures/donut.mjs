import { createDonutGeometry } from '../donut-geometry.mjs';

export function donutFixture(values = [40, 35, 15, 10]) {
    const names = ['Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco'];
    const colors = ['#111827', '#334155', '#475569', '#64748b', '#374151'];
    const chart = createDonutGeometry(
        values.map((value, index) => ({
            id: `part-${index + 1}`,
            label: names[index],
            value,
            color: colors[index],
        })),
        { cx: 150, cy: 150, innerRadius: 58, outerRadius: 90 },
    );
    const text = (part) =>
        `<span data-chart-label>${part.label}</span><strong data-chart-value>${part.value}%</strong>`;
    return `<figure data-chart-type="donut" data-chart-cx="150" data-chart-cy="150" data-chart-inner-radius="58" data-chart-outer-radius="90" style="display:flex;align-items:center;gap:32px;font-size:24px">
        <div style="position:relative;width:600px;height:600px">
        <svg viewBox="0 0 300 300" width="600" height="600">${chart.segments
            .map(
                (part) =>
                    `<path d="${part.path}" fill="${part.color}" data-chart-segment="${part.id}" data-value="${part.value}" data-label="${part.label}"${part.highlighted ? ' data-chart-highlight' : ''}></path>`,
            )
            .join('')}</svg>
        <aside data-chart-center style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center">${chart.maxima.length > 1 ? '<span data-chart-tie>Empate</span>' : ''}${chart.maxima
            .map(
                (part) =>
                    `<p data-chart-center-item="${part.id}" style="margin:0"><span data-chart-label style="display:block">${part.label}</span><strong data-chart-value style="display:block;font-size:32px">${part.value}%</strong></p>`,
            )
            .join('')}</aside></div>
        <ol style="display:grid;gap:16px">${chart.segments
            .map(
                (part) =>
                    `<li data-chart-legend="${part.id}" style="display:flex;gap:16px"><i data-chart-swatch style="display:inline-block;width:20px;height:20px;background:${part.color}"></i>${text(part)}</li>`,
            )
            .join('')}</ol>
    </figure>`;
}
