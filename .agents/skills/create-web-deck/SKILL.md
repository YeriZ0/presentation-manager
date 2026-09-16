---
name: create-web-deck
description: Create ZIP-ready HTML, CSS and JavaScript slide decks that follow Armadillo PP in Web deck.json, security, asset and template rules. Use when a user asks for presentation slides compatible with Armadillo PP in Web.
---

# Create a web deck

Create a complete Armadillo PP in Web presentation, validate it and package it as a ZIP. Ask only for information that the user has not already provided.

## Work mode and style selection

At the start of a new presentation, ask how the user wants to work:

- Guided from a topic
- Based on source documents
- Based on a supplied slide structure
- Resume or revise an existing presentation

Then discover template manifests matching `docs/templates/*/template.md`.

- Read only each manifest to obtain its ID, visible name and summary
- Present every discovered template by its visible name and summary
- Let the user select a template or request a custom visual direction
- After confirmation, load only the selected manifest and its `always` modules
- Resolve every module path relative to the selected template directory
- Reject absolute paths, backslashes, traversal segments and paths outside the selected template
- Keep format, security, asset and output rules in this skill; templates define visual decisions only
- If the project templates directory is unavailable, continue with a custom visual direction

Use the selected manifest progressively:

1. Read `structureIndex` when preparing the slide outline
2. Assign one structure ID to every proposed slide
3. After outline approval, load only the distinct structure files used by the deck
4. Load a `conditional` module only when its concern is present
5. Do not scan or concatenate every Markdown file in the template directory

## Two-phase questionnaire

Collect information in two phases and do not ask again for values already supplied.

### Phase 1: identity and design

Ask for these first three missing values in separate turns and in this order:

1. Exact presentation title
2. Member names, or confirmation that it is an individual presentation
3. Subject, or confirmation that it does not apply

Immediately after confirming the title:

1. Derive an ASCII lowercase slug with hyphens
2. Show `presentations/<slug>/` and let the user correct the slug
3. Check both the source folder and `presentations/packages/<slug>.zip` for collisions
4. If either exists, ask whether to replace it, create a new version or cancel
5. Create `presentations/<slug>/_working/sources/` and `presentations/<slug>/_working/structure/`
6. Tell the user to place documents in `sources/` and slide outlines in `structure/`

After subject, group the remaining missing values in this order:

- Optional subtitle
- Institution, faculty or career, and instructor
- Team name and presentation date
- Topic when it is not clear from the title
- Audience, language and slide count
- Institution and project logos
- Template-specific visual choices, color accent, typography and visual density
- Speaker notes preference

For each logo or image URL, ask whether to download it into the deck or keep the HTTPS URL. Remote hosts must be declared in `externalResources`.

### Phase 2: structure and content

- Read the source material supplied by the user
- Read only the selected template's `structureIndex` before choosing compositions
- Propose an exact numbered outline for the requested slide count
- Show the structure ID, purpose and main content for every item
- Let the user confirm or revise the outline
- Load only the distinct structure files referenced by the approved outline
- Load the density module when the content approaches a documented limit
- Collect only content that is still missing
- Confirm icon choices before creating generated presentation artifacts
- Collect speaker notes when requested

## Output location

Use an ASCII lowercase slug with hyphens. Reject traversal segments, absolute paths and backslashes.

```text
presentations/
  packages/
    <slug>.zip
  <slug>/
    _working/
      sources/
      structure/
    deck.json
    assets/
    slides/
    notes/
```

Keep the root fixed at `presentations/` and let the user customize only the slug. Reject empty slugs, reserved `packages`, Windows device names, traversal segments, absolute paths and backslashes. Ensure the resolved path remains under `presentations/`.

If `presentations/<slug>/` or `presentations/packages/<slug>.zip` already exists, ask whether to replace it, create a new version or cancel. Never overwrite either without confirmation.

Create the ZIP at `presentations/packages/<slug>.zip` only after validation. Package only `deck.json`, `assets/`, `slides/` and `notes/`. Never include `_working/`. The ZIP must contain `deck.json` at its root, not an enclosing `<slug>` folder.

Every ZIP entry name must use forward slashes, including directory entries. On Windows, do not use `Compress-Archive` because it writes backslashes into entry names. Use a ZIP tool that preserves POSIX paths, then inspect the raw entry names before delivery.

## Required slide structure

Every newly generated slide has three files:

```text
slides/001/index.html
slides/001/styles.css
slides/001/script.js
```

- Put all visible and editable text directly in `index.html`, in reading order
- Link `styles.css` with a relative path
- Load `script.js` locally with `defer`
- Do not generate visible text from JavaScript or CSS `content`
- Keep JavaScript limited to presentation behavior and animation activation
- Do not create navigation buttons, menus or timers inside slides
- Use complete semantic HTML documents
- Use a 1920x1080 viewport unless the user requests another supported size
- Respect `prefers-reduced-motion`

## Global animation lifecycle

This is a mandatory authoring rule for every slide, regardless of the selected template or custom visual direction. Templates may define duration, easing, distance and stagger, but they must not redefine the activation protocol.

- Use `web-deck:activate` as the only activation source inside Armadillo PP in Web
- Make activation idempotent and never hide elements that are already visible
- Do not combine immediate activation, `DOMContentLoaded` activation and `web-deck:activate`
- Use `DOMContentLoaded` only as a standalone fallback when `window.parent === window`
- Register the hosted activation listener before sending or awaiting other slide behavior
- Respect `prefers-reduced-motion` without leaving content hidden for a frame

Use this lifecycle unless the slide has no entrance animation:

```js
const root = document.documentElement;
let activated = false;

function activate() {
    if (activated) return;
    activated = true;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        root.classList.add('is-active');
        return;
    }

    requestAnimationFrame(() => root.classList.add('is-active'));
}

window.addEventListener('web-deck:activate', activate, { once: true });

if (window.parent === window) {
    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', activate, { once: true });
    } else {
        activate();
    }
}
```

## Phosphor icons

Use Phosphor Icons by default. The local source is `node_modules/@phosphor-icons/core/assets/`.

Accept icon requests as an exact Phosphor name, a semantic description or an official Phosphor URL. The user never needs to place icon files manually.

1. Identify concrete objects, actions, states or concepts in the approved outline
2. Exclude categories, leads and introductory text that would use icons only as decoration
3. Apply icons to every equivalent peer item or to none of them
4. Infer suitable icon names for the remaining concepts
5. Verify each candidate exists in the local Phosphor assets
6. Present a compact mapping of concept, icon name, weight and semantic reason
7. Ask the user to confirm or revise the mapping
8. Copy only approved SVG files to `assets/icons/phosphor/`
9. Reference the copied files with relative paths from slide HTML

Use `regular` as the default weight. Available weights are `thin`, `light`, `regular`, `bold`, `fill` and `duotone`. Regular files use `<name>.svg`; other weights use `<name>-<weight>.svg`.

The selected template may override the visual weight for a documented structure. Do not use letters in boxes as icon substitutes, and do not force an icon when no candidate has a clear semantic relationship.

If the local package is unavailable, use the official `phosphor-icons/core` repository only when web access is available. If neither source is available, mark the requested visual resource as pending. Never use a CDN, webfont, external script or runtime icon API by default.

When Phosphor assets are used:

- Copy its MIT license to `assets/licenses/phosphor-icons.txt`
- Add the library, source URL, version and used asset paths to `assets/ATTRIBUTIONS.md`
- Do not copy the complete icon library into a presentation

When the user requests alternatives, offer Phosphor, Lucide, Tabler Icons, Heroicons, Fluent UI System Icons, Bootstrap Icons, a custom source or no icons. Other libraries may be used only after the user selects one and its license is verified.

## Brand integrity

- Never invent, approximate, trace, redraw or simulate a logo
- Never place initials inside a circle, shield or other shape to imitate a missing logo
- Never replace an institution or project logo with a generic icon
- Use only an asset supplied by the user or an exact asset from a verified official source
- Do not recolor, crop, distort or rearrange a logo unless its official brand rules allow it
- Treat icons whose names end in `-logo` as trademarks, not generic decoration
- Record source, license and brand guidance in `assets/ATTRIBUTIONS.md`
- If authenticity or usage permission cannot be established, mark the logo as pending

## Pending visual resources

This is a general authoring rule, not a style-template rule and not player behavior.

When a slide reserves space for an image, logo, screenshot, diagram or illustration that has not been supplied:

1. Copy `public/resources/image-broken.svg` without modification to `assets/placeholders/image-broken.svg`
2. Reference that local copy explicitly from the slide HTML
3. Add descriptive `alt` text and a visible caption naming the missing resource
4. Keep the placeholder in the generated slide until the real asset is provided

If the source placeholder does not exist, report the problem and do not invent a replacement. Do not modify Armadillo PP in Web to inject placeholders into embedded content.

## Manifest and security

Use `references/deck.schema.json` as the manifest contract. Keep `deck.json` at the package root and list slides in presentation order.

- Use local CSS, JavaScript, images, icons and fonts whenever possible
- Do not load external scripts
- Do not call APIs, WebSocket servers or other network services
- Do not create forms, popups or downloads
- Keep external image and font hosts in `externalResources`
- Use HTTPS for every allowed external resource
- Keep speaker notes in separate Markdown files
- Use only relative package paths with forward slashes

## Delivery

Before creating the ZIP, follow `references/validation-checklist.md`. Verify every declared file exists, every slide ID is unique, every path is safe, all required licenses are present and the manifest matches the schema.
