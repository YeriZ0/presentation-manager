const lines = [
    [
        ['keyword', 'const'],
        ['plain', ' '],
        ['variable', 'result'],
        ['punctuation', ' = '],
        ['keyword', 'await'],
        ['plain', ' '],
        ['variable', 'repository'],
        ['punctuation', '.'],
        ['function', 'find'],
        ['punctuation', '({'],
    ],
    [
        ['property', '    status'],
        ['punctuation', ': '],
        ['string', "'active'"],
        ['punctuation', ','],
    ],
    [
        ['property', '    limit'],
        ['punctuation', ': '],
        ['number', '20'],
        ['punctuation', ','],
    ],
    [['punctuation', '});']],
    [['comment', '// Conservar solo los campos usados por la vista']],
    [
        ['keyword', 'const'],
        ['plain', ' '],
        ['variable', 'items'],
        ['punctuation', ' = '],
        ['variable', 'result'],
        ['punctuation', '.'],
        ['property', 'items'],
        ['punctuation', '.'],
        ['function', 'map'],
        ['punctuation', '((item) => ({'],
    ],
    [
        ['property', '    id'],
        ['punctuation', ': '],
        ['variable', 'item'],
        ['punctuation', '.'],
        ['property', 'id'],
        ['punctuation', ','],
    ],
    [
        ['property', '    label'],
        ['punctuation', ': '],
        ['variable', 'item'],
        ['punctuation', '.'],
        ['property', 'title'],
        ['punctuation', ','],
    ],
    [
        ['property', '    owner'],
        ['punctuation', ': '],
        ['variable', 'item'],
        ['punctuation', '.'],
        ['property', 'owner'],
        ['punctuation', ','],
    ],
    [['punctuation', '}));']],
    [],
    [
        ['keyword', 'return'],
        ['punctuation', ' { '],
        ['property', 'items'],
        ['punctuation', ', '],
        ['property', 'count'],
        ['punctuation', ': '],
        ['variable', 'items'],
        ['punctuation', '.'],
        ['property', 'length'],
        ['punctuation', ' };'],
    ],
];

export function CodeSpecimen() {
    return (
        <div className="code-body" data-code-sample>
            <div className="code-block">
                <div className="code-meta">
                    <span>repository.js</span>
                    <span data-code-range>JavaScript · líneas 18–29</span>
                </div>
                <pre data-code-start="18" data-code-end="29">
                    <code>
                        {lines.map((line, index) => {
                            const isFocus = index >= 5 && index <= 9;
                            return (
                                <span
                                    className={`code-line ${isFocus ? 'code-focus' : ''}`}
                                    data-code-line
                                    data-code-focus={isFocus ? '' : undefined}
                                    aria-describedby={
                                        isFocus ? 'code-focus-note' : undefined
                                    }
                                    key={index}
                                >
                                    <b data-code-number aria-hidden="true">
                                        {String(index + 18).padStart(2, '0')}
                                    </b>
                                    <em data-code-content>
                                        {line.length === 0
                                            ? ' '
                                            : line.map(
                                                  (
                                                      [type, value],
                                                      tokenIndex,
                                                  ) => (
                                                      <span
                                                          className={`code-token code-${type}`}
                                                          data-code-token={type}
                                                          key={`${type}-${tokenIndex}`}
                                                      >
                                                          {value}
                                                      </span>
                                                  ),
                                              )}
                                    </em>
                                </span>
                            );
                        })}
                    </code>
                </pre>
            </div>
            <aside className="code-note" id="code-focus-note" data-code-note>
                <span>Lectura</span>
                <strong>
                    La transformación conserva solo los campos que la vista
                    necesita.
                </strong>
            </aside>
        </div>
    );
}
