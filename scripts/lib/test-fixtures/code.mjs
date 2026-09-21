export function codeFixture(count = 3, separator = '') {
    return `<span data-code-range>Líneas 18–${17 + count}</span><pre data-code-start="18" data-code-end="${17 + count}"><code>${Array.from(
        { length: count },
        (_, index) =>
            `<span data-code-line${index === 0 ? ' data-code-focus aria-describedby="note"' : ''}><b data-code-number aria-hidden="true">${18 + index}</b><span data-code-content><span data-code-token="keyword">const</span> <span data-code-token="variable">value</span> = <span data-code-token="number">${index}</span>;</span></span>`,
    ).join(
        separator,
    )}</code></pre><aside id="note" data-code-note>Resultado del ejemplo</aside>`;
}

export const codeStyles = `
    pre { margin: 0; padding: 24px; font: 23px/1.35 Consolas, monospace; white-space: normal; }
    [data-code-line] { display: flex; }
    [data-code-number] { flex: 0 0 3ch; }
    [data-code-content] { white-space: pre; }
`;
