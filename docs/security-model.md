# Security model

Uploaded HTML is untrusted, including HTML uploaded by authenticated users.

The player applies these controls:

- Each slide runs in an iframe with `sandbox="allow-scripts"`.
- Same-origin access, forms, popups, downloads and top navigation are disabled.
- `connect-src 'none'` blocks fetch, XHR, WebSocket and EventSource connections.
- External scripts are not allowed.
- Images and fonts are restricted to local files or hosts declared in the manifest.
- ZIP paths are normalized and traversal paths are rejected.
- Notes are never placed in the slide document.

External resources are still a network dependency. Use local assets for reliable offline presentations.

Mermaid is a development-only compiler. A package may contain inert `.mmd` sources under `diagrams/`, but the player does not expose them as Blob URLs or inject them into the slide DOM. The packaged slide contains a sanitized inline SVG. Compilation rejects embedded configuration, links, events, active HTML, `foreignObject` and external references, and no Mermaid runtime is allowed in the ZIP.

## PowerPoint export

PowerPoint export renders each imported slide in its existing sandbox and transfers a static HTML snapshot to the application. Slide scripts, event-handler attributes, forms, embedded frames and JavaScript URLs are removed before reconstruction. The conversion frame runs the locally packaged `dom-to-pptx` runtime and receives the sanitized snapshots. It uses `sandbox="allow-scripts allow-same-origin"` to let the application reconstruct the static DOM; imported slide scripts are not executed there. Its content security policy restricts image, font and connection sources to prepared resources and the hosts declared in the manifest. The final file bytes return to the application, which initiates the download. Slide notes are read by the application and are not exposed to slide scripts.

Export uses computed styles and therefore reflects rendered content, not a general execution or conversion of slide JavaScript. Local `@font-face` data resources can be embedded; external resources that the player cannot load, and canvas content that is not origin-clean, cannot be faithfully exported. The conversion frame is removed and temporary object URLs are revoked on success, cancellation and failure.
