# Relay by LOTOS · Informe de cierre

**25 de noviembre de 2026 · GO para integrar y grabar con el build local.** La puesta al día de Firebase Hosting queda pendiente de autorización de despliegue. El preview público existente sirve RC1 y sus intentos cloud desde perfiles limpios fueron rechazados por App Check durante esta auditoría.

## Git e integración

| Referencia | Estado al inicio |
| --- | --- |
| `main` | `c474e139be18563ac2417af696ec532e2a58028c` |
| `release/relay-rc1` | `8295027537b008f49be050a712ac93fa521372cf` · [CI de RC1](https://github.com/Adal612Git/relay/actions/runs/45387743354) |
| `design/relay-polish-rc` | `0b3b60b392a847d2d4792d2cdb8c5fa6a1787912` · GitGuardian aprobada y CI ausente por el filtro de ramas |
| PR abiertas | #1, #3, #4, #5, #6, #7, #8, #9, #10 y #11. Estado inicial `CLEAN`, sin decisión de revisión registrada. |
| Checkouts | `RelayByLotos` estaba sincronizado con `origin/main` y tenía 6 cambios rastreados y 5 archivos sin seguimiento. `RelayByLotos-rc1` estaba limpio y sincronizado con `origin/release/relay-rc1`. |

El commit aprobado de código y pruebas de integración es [`ebfbcfcf0c681181ec6ec736b7a59c59121c9aa3`](https://github.com/Adal612Git/relay/commit/ebfbcfcf0c681181ec6ec736b7a59c59121c9aa3). El cierre pasa por [`release/relay-final` → `main` en la PR #12](https://github.com/Adal612Git/relay/pull/12). GitHub registra el SHA de fusión en esa PR y el [issue #2](https://github.com/Adal612Git/relay/issues/2) incluye el resultado de las comprobaciones posteriores a la fusión. El checkout para grabar es `RelayByLotos-final`. Los dos checkouts anteriores conservan sus archivos y se copiaron los dos archivos `.env` ignorados al worktree de grabación.

| PR | Aportación verificada en el árbol final |
| --- | --- |
| [#1](https://github.com/Adal612Git/relay/pull/1), [#7](https://github.com/Adal612Git/relay/pull/7), [#10](https://github.com/Adal612Git/relay/pull/10) | Sus tres heads son ancestros de la integración. Aportan el MVP, la base RC1 y el refinamiento Jade, respectivamente. Entre RC1 y #10 cambiaron solo CSS, tokens y el documento de diseño. |
| [#3](https://github.com/Adal612Git/relay/pull/3), [#4](https://github.com/Adal612Git/relay/pull/4) | Sus parches tienen equivalentes en RC1. Los tests conservan límites, original inmutable y exclusiones. RC1 redacta en línea para preservar hechos cercanos y amplía la cobertura de credenciales, IPv6, Unicode y exclusiones repetidas. |
| [#5](https://github.com/Adal612Git/relay/pull/5) | RC1 incorpora los escenarios y las pruebas de fidelidad. La comparación del árbol confirma el regex de timestamps corregido y amplía las exclusiones de A2 y A3. |
| [#6](https://github.com/Adal612Git/relay/pull/6) | RC1 adapta el foco, el reflujo estrecho y el bloqueo de revisión y copia con campos incompletos o una operación activa. Las pruebas preservan estos controles y el aislamiento de respuestas. |
| [#8](https://github.com/Adal612Git/relay/pull/8), [#9](https://github.com/Adal612Git/relay/pull/9), [#11](https://github.com/Adal612Git/relay/pull/11) | El diff, los ancestros parciales y los parches equivalentes confirman en #10 los tokens y contrastes de la base, el reflujo del workspace y los estados de control, foco y colores forzados. Las aportaciones quedan cubiertas por #12. |

Se revisaron `merge-base`, `cherry`, el historial, los diffs acumulados y los archivos finales. Se mantuvieron el adaptador Firebase, `firebase.json`, los casos A1–A3 y los controles de redacción, aprobación revocable y solicitudes obsoletas de RC1.

## QA local y visual

| Prueba | Resultado |
| --- | --- |
| `npm ci`, `npm run format:check`, `npm run check:files`, `npm run typecheck` | PASS con Node 24.11.1 y npm 11.6.4. |
| `npm test` | 79 de 79 pruebas unitarias y de componentes en 7 archivos. |
| `npx playwright install chromium`, `npm run test:e2e` | 3 de 3 pruebas en Chromium, incluida la revisión manual offline, la ruta alternativa de portapapeles y la accesibilidad a 320 px. |
| `npm audit` | 0 vulnerabilidades reportadas. |
| `npm run build`, `npm run preview` | PASS. `http://localhost:4174/` respondió HTTP 200 y ejecutó el flujo real. |
| GitHub Actions | Quality, Unit Tests, Build y Browser Tests en la PR final. El filtro ahora incluye PR hacia `release/**`. Se conservan los checks de `main`. [CI del código verificado](https://github.com/Adal612Git/relay/actions/runs/45591171417) · [Checks de la PR #12](https://github.com/Adal612Git/relay/pull/12/checks) · [CI de main](https://github.com/Adal612Git/relay/actions/workflows/ci.yml?query=branch%3Amain) |

Jade se conserva con tipografía de sistema, superficies planas, foco violeta y estados explícitos. En la revisión final, se sustituyeron las cajas de ejemplos y exclusiones por divisores dentro del panel. Chromium mostró cero violaciones en los barridos axe WCAG 2.1 AA y cero desbordamientos horizontales a 320, 390, 768, 1024, 1440 y 1920 px. El zoom nativo de navegador al 200 % redujo el viewport de 1422 a 711 CSS px sin desbordamiento. Se recorrieron foco inicial, enlace de exclusión con retorno al original, notas extensas, límite de 12 001 caracteres, estado vacío, análisis en curso, error recuperable y resultados.

Las capturas están en `.firebase/final-qa/` del worktree de grabación. `review-<ancho>.png` documenta los seis tamaños. `browser-zoom-200.png`, `long-exclusion-320.png`, `validation-error-320.png` y `local-model-error-320.png` cubren los casos de reflujo y recuperación. `real-device-loading.png`, `real-device-analysis-offline.png`, `real-hybrid-result.png` y `real-hybrid-cloud-result.png` muestran estados de ejecución real con datos sintéticos.

## Firebase real

**4 de 4 PASS** con `npm run test:integration` contra el build de producción en `http://localhost:4174`, Chrome 158.0.8127.88 y el perfil dedicado. El perfil utiliza atestación Enterprise genuina. Los perfiles limpios devolvieron HTTP 403 `PERMISSION_DENIED` al intercambiar la atestación en varias ejecuciones previas. El perfil dedicado permitió probar ambos modos con las configuraciones existentes.

| Capacidad | Evidencia |
| --- | --- |
| Análisis privado y offline | A1 completó `ONLY_ON_DEVICE` con la pestaña online y volvió a completarlo sin conexión. Cero solicitudes externas con marcadores privados y cero llamadas a inferencia cloud en ese flujo. |
| Generación híbrida y fuente | `PREFER_ON_DEVICE` devolvió `ON_DEVICE` para A1. Chrome sin Prompt API devolvió `IN_CLOUD` para A1, A2 y A3 por el endpoint `gemini-3.5-flash-lite:generateContent`. |
| App Check | Las solicitudes autorizadas devolvieron HTTP 200 y contenían un encabezado App Check. La prueba A1 comprobó que el servidor rechaza la misma solicitud sintética sin atestación. |
| Aprobación y revocación | El ensayo de A1 comprobó que generar requiere aprobación, que editar la revoca y que restaurar el texto exige volver a aprobar. Las pruebas de componentes cubren solicitudes concurrentes, edición, cambio de caso, limpieza y respuestas tardías. |
| Privacidad y persistencia | El cuerpo cloud de A1–A3 contenía como único dato variable la copia exacta aprobada. Los marcadores excluidos y el bloque original estuvieron ausentes. Las comprobaciones de URL, Web Storage, IndexedDB y consola no encontraron contenido del incidente para esos casos. |
| Fidelidad y recuperación | Las tres respuestas cloud pasaron validación de campos, timestamps, identificadores excluidos y afirmaciones prohibidas por cada fixture. Se comprobó la recuperación manual ante el error de modelo en Chromium y el copiado al portapapeles de un resultado generado en Chrome, tras la confirmación de revisión. |

El perfil de grabación seleccionó el modelo `v4`, y `chrome://on-device-internals` mostró el componente `gemma4_component`, la ruta activa de `weights.bin` y la versión `2026.11.3.1140`. El manifiesto instalado identifica `Optimization Guide On-Device Gemma4 Model`. Ese mismo perfil produjo inferencia local real. La insignia de Firebase proviene de `inferenceSource` e identifica el lugar de ejecución. [Configuración de Firebase](https://firebase.google.com/docs/ai-logic/hybrid/web/configuration-options) · [Inspección del modelo en Chrome](https://developer.chrome.com/docs/ai/understand-built-in-model-management) · [Configuración v4 en Chromium 158](https://github.com/chromium/chromium/blob/158.0.8127.88/chrome/browser/about_flags.cc#L4607-L4611)

## Preview, inicio y grabación

El [preview público RC1](https://relay-by-lotos--rc1-2uvff4zh.web.app/) respondió HTTP 200 y cargó el workspace. Sirvió `index-D_yeMcLk.css`, mientras que el build final sirvió `index-BSKbEiMf.css`. El paquete con configuración de staging está preparado en `.firebase/final-hosting/dist` y queda pendiente de autorización para desplegar. Antes de usar Hosting para evaluadores, hace falta confirmar allí una generación cloud atestada desde un perfil nuevo.

Desde `RelayByLotos-final`, con los archivos locales de Firebase ya configurados:

```powershell
npm ci
npm run build
npm run preview -- --host localhost --port 4174 --strictPort
```

Con el preview abierto, cerrar otras ventanas del perfil dedicado antes de reproducir la integración:

```powershell
$env:RELAY_INTEGRATION_BASE_URL = 'http://localhost:4174'
$env:RELAY_CHROME_TEST_PROFILE = Join-Path $env:TEMP 'relay-chrome-v4-xscvbwz0'
$env:RELAY_CHROME_MODEL_V4 = '1'
npm run test:integration
```

Lista para seguir el [guion de 2:40](DEMO-SCRIPT.md):

- [ ] Abrir el build local en Chrome de escritorio con el perfil v4 y precalentar el modelo con un ensayo de A1. Limpiar el incidente antes de grabar.
- [ ] Cargar **Try A1** y esperar **On-device analysis complete**.
- [ ] Mostrar la copia editable, abrir una referencia de las exclusiones y verificar ambos timeouts y la causa sin confirmar.
- [ ] Aprobar el texto visible, generar y leer la insignia real de fuente. Para una toma cloud, usar el mismo perfil con Prompt API desactivada y confirmar **Generated in the cloud**.
- [ ] Revisar los cuatro campos, confirmar **Review complete**, copiar el resultado y limpiar el incidente.
- [ ] Dejar la publicación del video y la aprobación del envío en Devpost a cargo del propietario.

**Veredicto · GO para grabación local con el perfil verificado.** El preview público final y la validación cloud desde un perfil limpio de evaluador siguen pendientes.
