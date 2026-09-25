# Web deck format

Armadillo PP in Web accepts a ZIP with this structure:

```text
deck.json
diagrams/001/main.mmd
diagrams/config.json
slides/001/index.html
assets/
notes/001.md
```

`deck.json` must be located at the root. A minimal manifest is:

```json
{
    "format": "web-deck",
    "version": 1,
    "title": "My class presentation",
    "viewport": { "width": 1920, "height": 1080 },
    "slides": [
        {
            "id": "intro",
            "source": "slides/001/index.html",
            "notes": "notes/001.md"
        }
    ]
}
```

The `slides` array defines presentation order. Every `source` and `notes` path must exist inside the ZIP and must not contain `..`, backslashes or absolute paths.

A relational diagram adds an optional `diagram` object to its slide:

```json
{
    "id": "validation-flow",
    "source": "slides/001/index.html",
    "diagram": {
        "engine": "mermaid",
        "engineVersion": "11.17.2",
        "type": "workflow",
        "source": "diagrams/001/main.mmd",
        "sourceHash": "64-character lowercase SHA-256"
    }
}
```

The hash covers the exact UTF-8 bytes of the `.mmd` file. Mermaid source is editable but inert. The slide contains the compiled inline SVG, while `diagrams/config.json` records the closed rendering configuration. Mermaid itself is never included in or executed by the package.

## Slide rules

- Use a complete HTML document or an HTML document with a body.
- Keep the viewport dimensions declared in the manifest.
- Put local CSS, JavaScript, images and fonts in the ZIP.
- Keep approved Mermaid sources under `diagrams/`; do not place `.mmd` files elsewhere.
- Use relative paths for local assets.
- Do not add navigation controls. The player owns navigation.
- Do not load external scripts.
- Do not package or initialize the Mermaid runtime. Compile diagrams before packaging.
- Do not call APIs, WebSocket servers, forms or downloads.
- Images and fonts may use HTTPS hosts declared in `externalResources`.

The player runs every slide in a sandboxed iframe and exposes no private presentation data to it.
