# R01 · Claridad de Review y preparación de grabación

## Estado y trazabilidad

- Fecha: 27 de noviembre de 2026, ronda de recuperación iniciada aproximadamente a las 03:43 de Guadalajara (UTC−06:00). Registro cerrado después de las 03:53; consultar las horas de los commits para la persistencia.
- Repositorio: https://github.com/Adal612Git/relay
- Base verificada: `design/lotos-editorial-v2`, PR #13, `f795eaaf28a2ff38db6b701b4d4fd3ce5470c109`.
- Rama de esta ronda: `design/night-20261127-review-clarity`. Fue creada nueva; no se sustituyó ninguna rama existente.
- Primer cambio visual: `1ee2aaf30504af0fb7f42e256a03e3ceed698f1f`.
- Corrección de QA visual, candidata de código final: `b5c7a8f4c814e6523609be281ed4e17daa7ba660`.
- Estado: **persistida, conservar para revisión en borrador**. No constituye aprobación de producto, despliegue ni cumplimiento del umbral de 90 en todas las dimensiones.
- La documentación y la evidencia se añaden en un commit posterior; su SHA es el head del PR que contiene este registro.

## Continuidad y concurrencia

Se consultaron el [tablero #2](https://github.com/Adal612Git/relay/issues/2), sus comentarios recientes, todas las ramas, las PR y los documentos editoriales. No había rama ni registro nocturno persistido antes de esta ronda.

La candidata editorial está 1 commit adelante y 0 detrás de main, 2 adelante y 0 detrás de release/relay-final, y 6 adelante y 0 detrás de design/relay-polish-rc. Main seguía en `de573fb6b909b0ea23422cfab6342d227490be95`; release/relay-final en `9648ebe7f598cd00cf31e840dc21317f6d768dea`; polish en `0b3b60b392a847d2d4792d2cdb8c5fa6a1787912`.

Se comprobó el head editorial antes de crear el primer árbol remoto y la ausencia de la rama nueva. Las actualizaciones de la rama propia usan expected_sha y fast-forward. No se encontraron cambios concurrentes en las bases observadas. La base anterior se conserva íntegra.

El [CI histórico de editorial](https://github.com/Adal612Git/relay/actions/runs/45600014608) figura completed/success para f795eaaf, el 25 de noviembre. Es evidencia histórica consultada hoy, separada de las ejecuciones nuevas descritas abajo.

## Defecto elegido y decisiones

El original privado y la copia editable tenían casi el mismo peso visual. A 390 y 320 px sus bordes se tocaban y podían parecer una sola hoja. La aprobación quedaba visualmente relegada respecto de las exclusiones.

Se conservaron la retícula, las fuentes locales Geist/Geist Mono, los textos de producto y la secuencia Capture → Review → Handoff. Los únicos cambios de aplicación están en `src/styles.css`:

1. Original en marfil, con regla superior más discreta.
2. Cabecera de la copia editable en oliva pálido; cuerpo blanco y etiqueta Editable conservados.
3. Franja de aprobación que agrupa estado, explicación y acción.
4. Mensaje de exclusiones vacío con fondo localizado de advertencia y texto completo.
5. Separación de 12 px entre documentos apilados.
6. Estado Revoked con el mismo color de error en inspector y franja.

No cambiaron TS/TSX, componentes, eventos, API, autenticación, SDK, rutas, modelos, contratos ni datos. El guion de grabación se corrigió únicamente en documentación: A1 es el texto visible, Analyze locally es la acción actual, y Open handoff precede a Generate handoff.

### Propuestas rechazadas

- Sombra interior en el editor: redundante con cabecera y regla, ajena a la sobriedad buscada.
- Teñir toda la copia de verde: podría sugerir aprobación antes de la revisión humana.
- Ilustraciones nuevas: no resolvían el defecto de comparación; no se copiaron activos ni marcas.
- Añadir un outline de error más específico: complicaba la precedencia del foco en forced colors. Se mantuvo el foco existente.
- Rehacer ahora la retícula o colapsar documentos móviles: ampliaría el alcance de una ronda orientada a recuperar una candidata comprobable.

QA rechazó además una inconsistencia de la primera versión: Revoked rojo en franja y ocre en inspector. Se corrigió en b5c7a8f4 y se volvió a comprobar visualmente y mediante estilos computados.

## Referencias consultadas

Fuentes leídas el 27 de noviembre de 2026. Los principios siguientes son aplicaciones propias, no una reproducción de sus diseños.

| Fuente y fecha | Principio aplicado |
| --- | --- |
| [Linear: A calmer interface for a product in motion](https://linear.app/now/behind-the-latest-design-refresh), 12 marzo 2026 | El contenido de trabajo debe dominar sobre los apoyos de navegación; evitar acentos redundantes. |
| [It's Nice That: Callum Abbott y el diseño de publicaciones alrededor de la tipografía](https://www.itsnicethat.com/articles/callum-abbott-other-almanac-mutt-art-review-graphic-design-publication-project-181126), 18 noviembre 2026 | La composición y la tipografía pueden aportar carácter sin añadir imágenes nuevas. No se trasladan su paleta ni su multiplicidad de fuentes. |
| [Pentagram: Nothing Personal](https://www.pentagram.com/work/nothing-personal), plataforma lanzada en 2025; caso consultado en noviembre 2026 | Un marco editorial puede expresar funciones distintas y conservar parentesco con la marca madre. Se aplica con tokens propios de LOTOS. |
| [W3C: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html), [Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) y [Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), consultados 27 noviembre 2026 | Revisar 320 CSS px, foco visible y contraste; el color acompaña a etiquetas textuales. |

## Crítica y puntuación de perspectivas simuladas

Cinco perspectivas de IA, no personas contratadas. Las notas son juicios de revisión, no porcentajes de conformidad WCAG ni resultados de un estudio con usuarios. Arte/producto/marketing inspeccionaron escritorio 1366×768 y móvil 390; UX/QA también inspeccionaron 320, 768, 1024 y los estados adicionales.

Orden de dimensiones: marca, jerarquía, composición, diferenciación, claridad, acabado, accesibilidad, consistencia.

| Rol | Base | Candidata final |
| --- | --- | --- |
| Dirección de arte editorial | 88 / 82 / 86 / 87 / 84 / 86 / 83 / 90 | 88 / 89 / 88 / 88 / 90 / 89 / 85 / 91 |
| Producto senior | 87 / 80 / 85 / 83 / 81 / 86 / 83 / 90 | 87 / 88 / 88 / 85 / 90 / 89 / 85 / 91 |
| Marketing B2B | 85 / 79 / 83 / 82 / 80 / 84 / 81 / 88 | 85 / 87 / 86 / 84 / 88 / 88 / 84 / 90 |
| UX/accesibilidad | 88 / 86 / 85 / 84 / 86 / 86 / 88 / 88 | 88 / 89 / 88 / 86 / 91 / 89 / 90 / 90 |
| QA visual | 87 / 85 / 84 / 84 / 85 / 85 / 87 / 88 | 87 / 89 / 88 / 86 / 90 / 89 / 90 / 90 |

**El umbral orientativo de 90 en todas las dimensiones no se alcanza.** No se ajustaron las notas para aprobar.

Objeciones residuales: la singularidad de marca apenas cambia; el inspector tiene terminología densa; los documentos mono de 13 px requieren atención en video reducido y desplazamiento interno a anchos intermedios; móvil mantiene una página larga. La aprobación cabe en escritorio pero está cerca del borde inferior. Ninguno justifica una nueva reorganización urgente antes de grabar.

## Verificación nueva y alcance exacto

Entorno aislado Linux, Node 24.22.3, npm 11.19.1, Playwright 1.56.1 con Chromium 141.0.7390.37. Instalación con `npm ci --ignore-scripts --no-audit --no-fund`; no se cambiaron paquetes ni lockfile. No se usaron servicios de pago.

| Comprobación | Resultado real | Alcance |
| --- | --- | --- |
| Baseline: build y 80 unidades/componentes | Pasaron | f795eaaf antes de modificar. |
| Baseline: 3 E2E existentes | Pasaron | Flujo manual, clipboard, offline, teclado y 320 px. |
| Baseline: capturas y axe | 21 barridos sin violaciones, dos fuentes cargadas, sin overflow | Tres etapas × 320, 390, 768, 1024, 1366, 1440 y 1920. |
| Candidata inicial: typecheck, build, formato y archivos | Pasaron | CSS de 1ee2aaf3; documentación no modifica runtime. |
| Candidata inicial: unidades/componentes y E2E | 80 y 3 pasaron | Suites existentes, sin Firebase real. |
| Candidata inicial: capturas y axe | 21 barridos sin violaciones, fuentes cargadas, sin overflow | Mismos siete anchos y tres etapas; build de producción. |
| Corrección final de color | Build/TypeScript y recorrido puntual pasaron | b5c7a8f4: el único ajuste adicional es uniformar el color Revoked. No se repitieron unidades/E2E para ese token; se probó el estado afectado. |
| Recorrido puntual final | Pasó; dos barridos axe adicionales sin violaciones | Vacío, inválido, aprobación, revocación, teclado, forced colors y breakpoints. |
| Firebase real | **BLOCKED**, preflight exit 2 | Faltan las cuatro variables públicas VITE de Firebase/App Check en esta copia. No se envió ninguna petición. |
| Chrome/modelo real, lector auditivo y zoom nativo | Pendientes en esta ronda | La evidencia histórica del 25 nov se conserva en EDITORIAL-QA; no se presenta como prueba nueva. |

La franja pendiente y aprobada deja el borde inferior del CTA en **741.3125 px** dentro de 1366×768. El espacio móvil es **12 px**. Revoked computa **rgb(142, 48, 39)** en ambos lugares. El campo inválido conserva foco de teclado de **2 px sólido** en forced colors.

Se comprobaron además 320, 624, 625, 928, 929, 1120 y 1121 px sin overflow de Review. La referencia Line 6 enfoca el original readonly y conserva la selección. Editar revoca la aprobación y retira Open handoff. No se alteró ese comportamiento.

### Incidencias de la verificación, sin ocultarlas

- El primer arranque de capturas coincidió con la extracción del navegador y devolvió ETXTBSY. Se esperó a que terminara la instalación.
- Un segundo intento usó un servidor iniciado en otra ejecución aislada y recibió ERR_CONNECTION_REFUSED. Se ejecutaron servidor y captura dentro del mismo proceso de verificación; funcionó.
- El recorrido puntual inicial comparó innerText con texto mixto y falló porque CSS lo transforma a mayúsculas. Se corrigió la aserción a textContent, sin cambiar la app, y se repitió el recorrido.
- El CDN primario de Playwright devolvió 403; el instalador oficial completó la descarga mediante su siguiente endpoint. No se modificaron controles de acceso.

## Evidencia y reproducción

- [Escritorio antes](review-before-1366.png) · [después](review-after-1366.png).
- [Móvil antes](review-before-390.png) · [después](review-after-390.png).
- [Sin exclusiones, 320 px](empty-320.png) · [inválido con forced colors, 320 px](forced-colors-320.png).
- [Aprobación revocada corregida](revoked-1366.png).
- [Resultados puntuales y contraste](checks.json).
- [Todas las capturas, logs, manifiesto y comprobador puntual](captures-and-checks.zip).
- [Instrucciones para abrir y grabar](RECORDING.md).

Las capturas generales después corresponden a 1ee2aaf3. La corrección b5c7a8f4 afecta solo Revoked; sus capturas de estado fueron regeneradas y están identificadas en el manifiesto. Las capturas antes fueron generadas de nuevo con f795eaaf, no sustituyen silenciosamente la evidencia histórica.

Para reproducir la matriz con una instancia local existente:

```sh
node scripts/capture-editorial.mjs http://localhost:4174/ <directorio-existente> 320 390 768 1024 1366 1440 1920
```

El PR se dirige a design/lotos-editorial-v2 para mostrar solo el incremento. El workflow actual filtra PR hacia main/release; por ello no se promete un nuevo CI automático en este PR apilado. Se documentan las ejecuciones locales reales.

## Próximo paso

Para grabar, iniciar el build en el origen local 4174 ya documentado y comprobar la inferencia real en el perfil Chrome preparado. La interfaz manual y el diseño ya se verificaron; no presentar un ensayo manual como inferencia AI.

Para la siguiente ronda, leer este registro antes de modificar. El mayor defecto residual es densidad/legibilidad a anchos intermedios y en video reducido. Proponer una alternativa solo si mejora ese problema con evidencia, conservando esta candidata. Consolidar ramas y SHAs en la ronda final sin fusionar ni desplegar.

