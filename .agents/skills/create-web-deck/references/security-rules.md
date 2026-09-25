# Reglas de seguridad

- Las diapositivas se ejecutan en un iframe aislado
- Las conexiones de red están bloqueadas
- Los scripts externos están bloqueados
- Usa activos locales siempre que sea posible
- Declara en el manifiesto los hosts HTTPS de imágenes y fuentes
- Nunca incluyas secretos en diapositivas ni notas
- No incluyas emojis en contenido, notas ni etiquetas de accesibilidad
- No obtengas datos de gráficos, definiciones de diagramas ni ejemplos de código durante la ejecución
- El código mostrado debe permanecer como texto inerte y no insertarse mediante `innerHTML` desde entrada no confiable
- No cargues runtimes de gráficos, diagramas ni resaltado de sintaxis desde CDN
- Mermaid se ejecuta solo durante la compilación local; su runtime no se copia ni se referencia desde las diapositivas
- Las fuentes `.mmd` se incluyen bajo `diagrams/` como texto inerte, permanecen fuera del sistema de archivos navegable del iframe y rechazan directivas, enlaces, eventos, HTML y estilos arbitrarios
- El SVG compilado se inserta inline después de rechazar scripts, eventos, enlaces, `foreignObject` y referencias externas
- Chart.js y Apache ECharts solo pueden usarse como archivos locales versionados bajo `assets/vendor/`
- Incluye únicamente el runtime requerido por el deck; omite todos si no hay gráficos
- Conserva la licencia del runtime y registra origen, versión y ruta en `assets/ATTRIBUTIONS.md`
- El runtime puede representar datos ya incluidos en la diapositiva, pero no obtener ni generar datos desde servicios de red
