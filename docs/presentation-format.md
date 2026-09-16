# Web deck format

Armadillo PP in Web accepts a ZIP with this structure:

```text
deck.json
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

## Slide rules

- Use a complete HTML document or an HTML document with a body.
- Keep the viewport dimensions declared in the manifest.
- Put local CSS, JavaScript, images and fonts in the ZIP.
- Use relative paths for local assets.
- Do not add navigation controls. The player owns navigation.
- Do not load external scripts.
- Do not call APIs, WebSocket servers, forms or downloads.
- Images and fonts may use HTTPS hosts declared in `externalResources`.

The player runs every slide in a sandboxed iframe and exposes no private presentation data to it.
