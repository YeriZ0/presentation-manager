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
