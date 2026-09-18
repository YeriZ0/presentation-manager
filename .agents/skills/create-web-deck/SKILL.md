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

Load a template's diagram module when a slide contains nodes, connectors, a directed flow or explicit relationships. Do not treat independent icon-and-description units as a relational diagram. When a template exposes diagram variants under one structure, assign the structure ID to the outline and select the variant separately from the structure ID.

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
- Load the density module whenever the user selected a density mode
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
- Render tables with semantic HTML, including `caption`, `thead`, `tbody` and scoped headers
- Render simple charts and diagram connectors with inline SVG already present in the HTML
- Chart.js and Apache ECharts are allowed only as local, vendored assets when the approved slide outline includes charts
- Prefer Apache ECharts with its SVG renderer for complex charts; use Chart.js for simple bar, line, area or doughnut charts
- Do not load Chart.js, ECharts, D3, Mermaid or any chart runtime from a CDN
- Do not include chart runtimes in decks that do not contain charts
- Keep chart data, labels, units, periods, sources and textual summaries in HTML
- Keep an accessible semantic data table or equivalent textual data alternative in HTML when a runtime chart is used
- Copy the selected chart runtime once into `assets/vendor/<library>/`, include its pinned version and license, and reuse it across slides
- Treat displayed code as escaped, inert text; never evaluate or import it

## Prohibited emoji content

This is a global rule for every template and every generated deck:

- Do not use emoji characters in visible slide text, titles, captions, notes, `alt`, `title` or ARIA labels
- Do not replace an icon, diagram or status indicator with an emoji
- Use an approved local icon or plain text instead
- The package validator rejects emoji content before creating the ZIP

## Contrast and resource status

Every visible text element must remain legible against the surface behind it. Generated decks must satisfy these minimum ratios:

- Normal text: 4.5:1
- Large text: 3:1
- Relevant icons, borders, chart marks and other non-text graphics: 3:1

Use `data-contrast-role="icon"` or `data-contrast-role="graphic"` for meaningful non-text elements that need auditing. Use `data-contrast-exempt="decorative"` only for elements that do not convey information. Do not use exemptions to hide a contrast failure.

The packager renders every slide at its declared viewport and blocks the ZIP when contrast is insufficient or when a visible surface cannot be verified. Keep text over opaque local surfaces; do not place essential text over unverified images or effects.

## Template immutability

- Treat the selected template and every file under `docs/templates/<template-id>/` as read-only during deck creation
- Use only structure IDs listed by the selected template's `structureIndex`
- Do not add new structure IDs, variants, components, tokens or rules to a selected template
- Do not modify a template to fit content that does not match one of its documented structures
- Adapt, split or simplify slide content to fit an existing structure
- If no existing structure can represent the content, stop and ask the user how to adapt the content; do not extend the template
- Changes to template files belong to a separate repository contributor task, not to deck generation

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

Use Phosphor Icons by default. The local source is `node_modules/@phosphor-icons/core/assets/`, and `scripts/icon-catalog.json` provides a curated core of general-purpose icons for templates.

Accept icon requests as an exact Phosphor name, a semantic description or an official Phosphor URL. The user never needs to place icon files manually.

The numbered workflow below applies when Phosphor remains selected. For a user-selected alternative library or user-supplied files, do not run `vendor:icons`; follow the alternative-source rules below and create the local stylesheet, manifest, license and attribution records directly.

1. Identify concrete objects, actions, states or concepts in the approved outline
2. Map them to semantic roles from `scripts/icon-catalog.json` when possible
3. Exclude categories, leads and introductory text that would use icons only as decoration
4. Apply icons to every equivalent peer item or to none of them
5. Infer suitable icon names for the remaining concepts
6. Verify each candidate exists in the local Phosphor assets
7. Present a compact mapping of concept, role, icon name, weight and semantic reason
8. Ask the user to confirm or revise the mapping
9. Record approved selections in `_working/icons.json`
10. Run `npm run vendor:icons -- presentations/<slug>` to copy only approved SVG files
11. Reference `assets/icons/icons.css` and use `data-icon` or semantic role classes from slide HTML

Use `regular` as the default weight. The asset generator accepts `regular`, `bold` and `duotone`. Regular files use `<name>.svg`; other weights use `<name>-<weight>.svg`.

The selected template may override the visual weight for a documented structure. Do not use letters in boxes as icon substitutes, and do not force an icon when no candidate has a clear semantic relationship.

If the local package is unavailable, use the official `phosphor-icons/core` repository only when web access is available. If neither source is available, mark the requested visual resource as pending. Never use a CDN, webfont, external script or runtime icon API by default.

When Phosphor assets are used:

- Copy its MIT license to `assets/licenses/phosphor-icons.txt`
- Add the library, source URL, version and used asset paths to `assets/ATTRIBUTIONS.md`
- Do not copy the complete icon library into a presentation
- Configure defaults with `--icon-size` and `--icon-color` on the template or slide container
- Override an individual icon with the same CSS variables when the composition requires it
- Use `regular` for normal use, `bold` for prominent roles and `duotone` only when the secondary opacity remains legible

When the user requests alternatives, offer Phosphor, Lucide, Tabler Icons, Heroicons, Fluent UI System Icons, Bootstrap Icons, a user-supplied source or no icons. Other libraries may be used only after the user selects one and its license is verified.

Never generate, draw, trace, approximate, combine or redraw an icon. A custom icon must be an existing file supplied by the user. If no approved library asset has a clear semantic relationship, omit the icon or ask the user to provide one. Do not reconstruct icons from screenshots or visual references.

For a user-selected alternative library:

- Copy only the approved static SVG assets into the deck
- Do not ship React components, webfonts, external scripts, CDN references or runtime icon APIs
- Verify that each asset works through local HTML and CSS without a library runtime
- Copy the applicable license into `assets/licenses/`
- Record the library, version, source URL, license and copied paths in `assets/ATTRIBUTIONS.md`
- Register every copied asset in `assets/icons/manifest.json` with `source: "library"`, library ID, version, license and HTTPS source URL
- Use one icon library per slide

Register a user-supplied icon in `assets/icons/manifest.json` with `source: "user"`, `providedByUser: true`, its packaged path and SHA-256. Store these files under `assets/icons/user/`; this declaration records provenance but does not grant new rights.

Functional SVG geometry such as diagram connectors, arrowheads, lifelines, axes and chart marks is not an icon. Logos and trademarks remain governed by Brand integrity.

## Template structure markers

When a selected template documents structure markers, place them directly in slide HTML so static and rendered validation can apply the template rules. For `academic-sober`, set these attributes on `body`:

```html
<body data-template="academic-sober" data-slide-structure="pillars"></body>
```

For thematic units:

- Mark each peer with `data-thematic-unit`
- Mark its short heading with `data-unit-topic`
- Mark its supporting text with `data-unit-description`
- Keep DOM order as topic, optional icon and description

For every internal `academic-sober` slide:

- Mark the main composition with `data-slide-body` and `data-vertical-align="center"`
- Center the composition as one unit between the header and footer
- Use no slide frame by default; declare `data-frame="graphite"` or `data-frame="accent"` only when the user selected one
- Style optional context above the title in sentence case, normal weight and italics; never force uppercase
- Never apply uppercase text transformation to academic-sober titles, footers, metadata, labels or table headers

For comparisons:

- Use exactly two `article` elements marked with `data-comparison-option`
- Keep each option in topic, icon and description order
- Mark the short central comparison text with `data-comparison-connector`
- Do not identify options with bars, separators or cards

For processes:

- Use an ordered list with three to five `data-process-step` items
- Mark number, title and description with `data-step-number`, `data-step-title` and `data-step-description`
- Mark the connector layer with `data-process-connectors`
- Use the approved Phosphor `arrow-fat-right` icon by default, or an equivalent arrow from the user-selected library, between consecutive steps
- Mark each connector with `data-process-arrow` set to the exact approved asset name and use the same asset between every step
- When a semantic role class differs from the asset name, also set `data-icon` to the exact asset name registered by `icons.css`
- Arrange every step on one horizontal axis from left to right with constant spacing

For narrative elements:

- Mark the copy and peer group with `data-narrative-copy` and `data-narrative-elements`
- Use two to four `article` elements marked with `data-narrative-element`
- Keep each peer in topic, icon and description order without separator lines

For donut charts:

- Set `data-chart-type="donut"` and mark three to five SVG segments with `data-chart-segment` and numeric `data-value`
- Mark matching legend entries with `data-chart-legend`
- Generate paths and legend entries from one data source and require values to total 100
- Use one center and constant inner and outer radii for every segment

For code:

- Mark every visible line with `data-code-line`
- Mark one contiguous focus region with `data-code-focus` and associate it with one `data-code-note`
- Mark syntax spans with `data-code-token` and the semantic token type
- Differentiate keywords, functions, variables, properties, strings, numbers, comments and punctuation with accessible syntax tokens
- Keep line numbers hidden from assistive technology

For relational diagrams:

- Use a `figure` with `data-diagram` and `data-reading-direction`
- For new `academic-sober` diagrams, keep `data-slide-structure="system-diagram"` and select `data-diagram-type="architecture|workflow|sequence|data-flow|lifecycle|hierarchy|relationship-map"` on the figure
- Mark each new node with a unique ASCII value in `data-diagram-node`
- Mark the inline connector SVG with `data-diagram-connectors`
- Mark each new connector path with a unique ASCII value in `data-diagram-edge`, plus `data-from` and `data-to` values that reference declared nodes
- Keep relationship labels in HTML with `data-diagram-label` and `data-for-edge`
- Associate a textual relationship description through `aria-describedby`
- Keep the diagram as the only body composition; title, identity and a short source or caption may remain outside it
- Center diagrams that use few nodes instead of stretching them to the viewport edges
- Use staggered nodes when that keeps equivalent connectors short and uniform
- Keep every relationship label clear of its line, arrowhead and adjacent nodes, and match the label color to its connector
- Render optional node context as ink-colored italic text without an underline or decorative bar
- Keep legacy untyped diagrams valid, but never author a new untyped diagram
- Use three to seven nodes by default; sequence permits two to six participants and three to ten messages
- Use `architecture` for parts and boundaries, `workflow` for decisions and responsibility, `sequence` for time-ordered messages, `data-flow` for information movement, `lifecycle` for state transitions, `hierarchy` for parent-child levels and `relationship-map` for one real center
- Use `process` instead of `workflow` when the content is a linear sequence of three to five steps without decisions
- Use HTML and CSS for nodes and layout, inline SVG for functional geometry and local JavaScript only for finite activation or motion
- Do not add Mermaid, D3, a diagram runtime, external scripts or runtime topology discovery

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
4. Mark the containing element with `data-resource-status="pending"`
5. Use visible feedback beginning with `Recurso pendiente:` so the audience can identify the missing resource
6. Keep the placeholder in the generated slide until the real asset is provided

If the source placeholder does not exist, report the problem and do not invent a replacement. Do not modify Armadillo PP in Web to inject placeholders into embedded content.

## Manifest and security

Use `references/deck.schema.json` as the manifest contract. Keep `deck.json` at the package root and list slides in presentation order.

- Use local CSS, JavaScript, images, icons, fonts and approved chart runtimes whenever possible
- Do not load external scripts
- Do not call APIs, WebSocket servers or other network services
- Do not create forms, popups or downloads
- Keep external image and font hosts in `externalResources`
- Use HTTPS for every allowed external resource
- Keep speaker notes in separate Markdown files
- Use only relative package paths with forward slashes
- When Chart.js or ECharts is used, record the exact version, source URL, license and copied asset path in `assets/ATTRIBUTIONS.md`

For charts, diagrams, tables and code, also verify the selected template's limits. Do not trade away readable text, honest scales or semantic structure to fit more content.

## Delivery

Before creating the ZIP, follow `references/validation-checklist.md`. Verify every declared file exists, every slide ID is unique, every path is safe, all required licenses are present and the manifest matches the schema.
