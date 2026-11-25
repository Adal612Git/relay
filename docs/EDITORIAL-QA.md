# QA · LOTOS Editorial

**25 de noviembre de 2026.** Rama `design/lotos-editorial-v2`, creada desde `de573fb6b909b0ea23422cfab6342d227490be95`. El worktree es `RelayByLotos-editorial`. El preview local de producción usa `http://localhost:4174/` y los archivos de entorno existentes. [CI de la rama](https://github.com/Adal612Git/relay/actions/workflows/ci.yml?query=branch%3Adesign%2Flotos-editorial-v2)

## Iteraciones en Chromium

1. **Primer montaje.** Se inspeccionaron Capture, Review y Handoff a 1366 y 320 px. A 1366 × 768 la altura del editor y las filas de anotaciones sacaban del primer viewport **Analyze locally** y **Approve this text**. En móvil se ajustó la separación entre tipo de exclusión y valor largo.
2. **Ritmo y proporción.** Se estrechó el índice, se ensanchó el margen técnico y se ajustaron las líneas y alturas. Se inspeccionaron 390, 768, 1024 y 1366 px. El último renglón de A1 pedía más espacio en la comparación de ancho intermedio. Se amplió allí la caja documental y se compactaron las filas del handoff para mantener el cuerpo, la revisión y el botón de copia visibles a 1366 × 768.
3. **Cierre de estados y reflujo.** Se inspeccionaron las tres pantallas, las capturas del viewport de 1366 × 768, documentos largos, bordes de foco, fuentes de inferencia reales y zoom. El enlace de salto quedaba parcialmente visible en algunas capturas de página completa. Se corrigió su ocultación fuera de foco y se repitió el recorrido con el build de producción.

## Evidencia de navegador

[Antes vacío](design/editorial/before-1366.png) · [Antes con A1](design/editorial/before-a1-1366.png) · [Propuestas](LOTOS-EDITORIAL.md#tres-composiciones-evaluadas)

| Ancho CSS | Capture | Review | Handoff |
| --- | --- | --- | --- |
| 320 px | [Capture](design/editorial/after/320-capture.png) | [Review](design/editorial/after/320-review.png) | [Handoff](design/editorial/after/320-handoff.png) |
| 390 px | [Capture](design/editorial/after/390-capture.png) | [Review](design/editorial/after/390-review.png) | [Handoff](design/editorial/after/390-handoff.png) |
| 768 px | [Capture](design/editorial/after/768-capture.png) | [Review](design/editorial/after/768-review.png) | [Handoff](design/editorial/after/768-handoff.png) |
| 1024 px | [Capture](design/editorial/after/1024-capture.png) | [Review](design/editorial/after/1024-review.png) | [Handoff](design/editorial/after/1024-handoff.png) |
| 1366 × 768 | [Capture](design/editorial/after/1366-capture-viewport.png) | [Review](design/editorial/after/1366-review-viewport.png) | [Handoff](design/editorial/after/1366-handoff-viewport.png) |
| 1440 px | [Capture](design/editorial/after/1440-capture.png) | [Review](design/editorial/after/1440-review.png) | [Handoff](design/editorial/after/1440-handoff.png) |
| 1920 px | [Capture](design/editorial/after/1920-capture.png) | [Review](design/editorial/after/1920-review.png) | [Handoff](design/editorial/after/1920-handoff.png) |

Los handoffs de la matriz se escribieron manualmente usando A1 para comparar la misma composición. La evidencia de inferencia usa el servicio real. [Análisis en curso](design/editorial/real/real-device-loading.png) · [Análisis offline](design/editorial/real/real-device-offline.png) · [Handoff `ON_DEVICE`](design/editorial/real/real-device-handoff.png) · [Handoff `IN_CLOUD`](design/editorial/real/real-cloud-handoff.png)

## Accesibilidad

- **Reflujo y contraste.** 21 barridos axe con etiquetas WCAG 2.0–2.2 AA, cero violaciones automatizadas y cero desbordamientos horizontales en los siete anchos. Ink sobre Paper obtuvo 14.08:1, Muted sobre Paper 5.29:1 y Document sobre Olive Dark 9.40:1. Las líneas que identifican controles superaron 3:1. [Mediciones](design/editorial/after/contrast.json)
- **Zoom y teclado.** El zoom de navegador al 200 % cambió el viewport de 1422 a 711 CSS px, con `scrollWidth = 711` en las tres etapas. Se verificaron salto al contenido, foco en el título al avanzar, acceso a las exclusiones por teclado y foco visible en colores forzados. [Capture](design/editorial/after/zoom200-capture.png) · [Review](design/editorial/after/zoom200-review.png) · [Handoff](design/editorial/after/zoom200-handoff.png) · [Colores forzados](design/editorial/after/forced-colors.png)
- **Estados y controles.** Se revisaron los nombres accesibles, el original de solo lectura, el orden del DOM, el botón de análisis deshabilitado al exceder el límite, la carga real y la preferencia de movimiento reducido. Los botones de acción y las referencias de exclusiones tienen 44 px de alto. [Validación a 320 px](design/editorial/after/error-320.png) · [Exclusión larga a 320 px](design/editorial/after/long-annotation-320.png)
- **Lectores de pantalla.** Se comprobó el árbol accesible real de Chromium para landmarks, encabezados, campos, casilla de revisión deshabilitada y etiquetas de los documentos. Queda pendiente una prueba auditiva con un lector de pantalla independiente. Los resultados indican cobertura automatizada y de teclado orientada a WCAG 2.2 AA.

## Verificación funcional

| Comando o recorrido | Resultado |
| --- | --- |
| `npm ci`, `npm run format:check`, `npm run check:files`, `npm run typecheck` | PASS con Node 24.11.1 y npm 11.6.4. |
| `npm test` | 80/80 en siete archivos. Se conservaron las regresiones de privacidad, aislamiento y respuestas obsoletas. Se agregó una prueba de persistencia de la sesión al cambiar de etapa. |
| `npx playwright install chromium`, `npm run test:e2e` | 3/3. Flujo manual offline, portapapeles real, alternativa cuando se deniega el portapapeles, navegación y foco. |
| `npm run build`, `npm run preview` | PASS. HTTP 200 en el preview local y las dos fuentes locales cargadas en Chromium. |
| `npm audit` | 0 vulnerabilidades reportadas. |
| `npm run test:integration` | 4/4 sobre el build de producción en `localhost:4174`. Chrome 158 probó `ONLY_ON_DEVICE` online y offline, `PREFER_ON_DEVICE` con `ON_DEVICE`, y A1–A3 con `IN_CLOUD` por Gemini 3.5 Flash-Lite. |
| Frontera real de Firebase | Las tres solicitudes cloud enviaron exclusivamente la copia aprobada como dato variable y devolvieron HTTP 200 con App Check. A1 confirmó rechazo sin atestación. Los marcadores privados estuvieron ausentes del payload, URL, Web Storage, IndexedDB y consola en los casos probados. |

El primer ensayo en `localhost:4186` completó el análisis privado, pero App Check bloqueó la autorización para generar. El preview se ejecutó de nuevo en `localhost:4174`, con el perfil de Chrome y el origen ya verificados. La suite completa pasó allí. Tras el último ajuste de CSS se repitieron los cuatro casos. Las tres pruebas cloud pasaron y la prueba del dispositivo pasó en un reintento tras un error recuperable de generación. Los adaptadores `src/lib`, la configuración Firebase y el lockfile coinciden con la base funcional. Se preservaron los checkouts previos y sus archivos de entorno. La rama está destinada a revisión en GitHub.

## Reproducir

```powershell
npm ci
npm run build
npm run preview -- --host localhost --port 4174 --strictPort
```

Con el preview abierto y la configuración local existente:

```powershell
node scripts/capture-editorial.mjs http://localhost:4174/
$env:RELAY_INTEGRATION_BASE_URL = 'http://localhost:4174'
$env:RELAY_CHROME_MODEL_V4 = '1'
$env:RELAY_CHROME_TEST_PROFILE = Join-Path $env:TEMP 'relay-chrome-v4-xscvbwz0'
npm run test:integration
```

La evidencia real se puede guardar con `RELAY_EDITORIAL_EVIDENCE_DIR` al ejecutar la suite sintética de integración.
