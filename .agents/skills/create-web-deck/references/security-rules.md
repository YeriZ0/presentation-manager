# Security rules

- Slides run in a sandboxed iframe.
- Network connections are blocked.
- External scripts are blocked.
- Use local assets whenever possible.
- Declare HTTPS image and font hosts in the manifest.
- Never include secrets in a slide or notes file.
- Do not include emoji characters in slide content, notes or accessibility labels.
- Do not fetch chart data, diagram definitions or code samples at runtime.
- Displayed code must remain inert text and must not be inserted through `innerHTML` from untrusted input.
- Do not load charting, diagramming or syntax-highlighting scripts from a CDN.
- Chart.js and Apache ECharts may be used only as pinned local files under `assets/vendor/`.
- Include only the chart runtime required by the deck; omit all chart runtimes when no chart exists.
- Preserve the selected runtime license and record its source, version and path in `assets/ATTRIBUTIONS.md`.
- Chart runtime code may render from data already embedded in the slide, but must not fetch or generate data from a network service.
