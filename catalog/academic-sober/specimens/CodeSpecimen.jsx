const lines = [
    'const result = await repository.find({',
    "    status: 'active',",
    '    limit: 20,',
    '});',
    '',
    'const items = result.items.map((item) => ({',
    '    id: item.id,',
    '    label: item.title,',
    '    owner: item.owner,',
    '}));',
    '',
    'return { items, count: items.length };',
];

export function CodeSpecimen() {
    return (
        <div className="code-body">
            <div className="code-block">
                <div className="code-meta"><span>repository.js</span><span>JavaScript · lineas 18-29</span></div>
                <pre><code>{lines.map((line, index) => <span className={`code-line ${index === 5 ? 'code-focus' : ''}`} key={`${index}-${line}`}><b>{String(index + 18).padStart(2, '0')}</b><em>{line || ' '}</em></span>)}</code></pre>
            </div>
            <aside className="code-note"><span>Lectura</span><strong>La transformacion conserva solo los campos que la vista necesita.</strong></aside>
        </div>
    );
}
