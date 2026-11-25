# LOTOS Editorial

**relay. · BY LOTOS**

El espacio de trabajo sigue el recorrido del incidente. **Capture** conserva el original privado, **Review** hace visible la frontera de intercambio y **Handoff** prepara el documento que recibirá el siguiente turno. La identidad se construye con marfil, oliva, tipografía grotesca y reglas que también organizan acciones y estados.

## Referencias y decisiones

| Referencia | Aplicación en Relay |
| --- | --- |
| Josef Müller-Brockmann | Retícula de doce columnas con márgenes de distinto peso. La mesa admite un documento ancho, una comparación a dos bandas y un documento de entrega con margen propio. [Swiss Grid, Poster House](https://access.posterhouse.org/exhibition/swiss-grid-2/) · [Swiss Style, Confederación Suiza](https://www.aboutswitzerland.eda.admin.ch/en/swiss-style-forever-the-story-of-a-graphic-design-tradition) |
| Emil Ruder y Armin Hofmann | Los pesos, líneas y espacios delimitan lectura, edición y permisos. Los tamaños de la numeración orientan la secuencia y el amarillo identifica el punto de revisión que requiere atención. [Swiss Grid, Poster House](https://access.posterhouse.org/exhibition/swiss-grid-2/) · [Swiss typography, Zürich](https://www.zuerich.com/en/art-culture/zurich-avantgarde/swiss-graphics-typography) |
| Massimo Vignelli | Las mismas alineaciones y reglas se mantienen en los tres pasos. Se reservan la grotesca para lectura y los monoespaciados para horas, referencias y metadatos. [The Vignelli Canon](https://www.lars-mueller-publishers.com/vignelli-canon) |
| Dieter Rams e iA Writer | El editor conserva altura útil y empieza por el texto del operador. Cada control visible pertenece a la tarea del paso actual. [Vitsœ](https://www.vitsoe.com/us/about/good-design) · [iA Writer](https://ia.net/writer/) |
| Karri Saarinen y Linear | La navegación compacta conserva posición y jerarquía al avanzar. Los focos de atención se concentran en el documento y una acción primaria por estado. [Linear](https://linear.app/now/how-we-redesigned-the-linear-ui) |
| Vercel y tipografía digital | Se compararon Geist, Inter y las grotescas de sistema, y Geist Mono frente a IBM Plex Mono. Geist y Geist Mono comparten proporciones de familia y permiten alinear números y tiempos con dos archivos locales variables. [Geist](https://vercel.com/geist/introduction) · [Inter](https://rsms.me/inter/) · [IBM Plex](https://www.ibm.com/plex/) |
| Microsoft HAX e incident.io | La aprobación y su revocación tienen texto propio. Se conserva el borrador frente a fallos, se indica la fuente recibida del SDK y las cuatro secciones distinguen hechos, acciones, incertidumbre y siguiente paso. [Microsoft HAX](https://www.microsoft.com/en-us/haxtoolkit/ai-guidelines/) · [incident.io](https://incident.io/) · [Incident timeline](https://incident.io/changelog/tell-the-full-story-with-your-incident-timeline) |
| Editorial contemporáneo | De *Citizen* se tomó la retícula capaz de cambiar con la historia. De las identidades de Irem Harnak se estudió el uso del oliva como señal localizada sobre páginas cálidas. El oliva oscuro se concentra en el paso activo, la acción y el encabezado del inspector. [Pentagram, Citizen](https://www.pentagram.com/work/citizen/story) · [Irem Harnak](https://www.iremharnak.com/studio) |

## Tres composiciones evaluadas

La comparación usa la misma información sintética, paleta y tipografía. Se abrió cada [prototipo HTML](design/editorial/proposals.html) en Chromium con un viewport de 1366 × 768. El [estado anterior de RC1](design/editorial/before-a1-1366.png) se capturó primero en el navegador.

| Composición | Originalidad e identidad | Lectura, uso y acceso |
| --- | --- | --- |
| [Mesa de revisión](design/editorial/proposal-spread.png) | Marca y numeración editorial claras. El margen de privacidad funciona como anotación técnica. | Alinea las versiones y mantiene la acción próxima a las exclusiones. Permite una secuencia móvil lineal. |
| [Galerada](design/editorial/proposal-galley.png) | Buen ritmo de catálogo con índice horizontal y rótulos de margen. | Dos documentos sucesivos aumentan la distancia entre una línea privada y su equivalente. La lectura aislada es cómoda. |
| [Folio](design/editorial/proposal-folio.png) | Lomo oliva reconocible y cuerpo amplio. | El inspector superior facilita identificar permisos al inicio. Su altura y el lomo persistente desplazan revisión y aprobación hacia abajo en 1366 × 768. |

Se eligió **Mesa de revisión** por la comparación simultánea y la relación entre las anotaciones, la aprobación y el límite de dispositivo. El índice horizontal de Galerada se aprovecha en anchos intermedios. Cada etapa adopta una composición propia dentro de la retícula compartida.

## Fundamentos

- **Identidad.** `relay.` en Geist con punto oliva y firma tipográfica `BY LOTOS`. La escuadra del inspector y las líneas continuas pertenecen a la retícula. Los números grandes orientan el paso actual. **Private processing. Human judgment.** identifica el principio operativo.
- **Color.** Paper `#F4F3ED` en el lienzo, Document `#FFFFFF` en superficies de lectura e Ink `#222420` en la tipografía. Olive Dark `#414A28` se usa en acciones y texto de marca. Olive `#747D42` ocupa el punto de la firma. El amarillo `#C7A84A` funciona como regla para anotaciones y aprobación pendiente. Los estados agregan texto y sus propios tonos de tinta.
- **Tipografía.** Geist aporta el título editorial de hasta 62 px y el título documental de hasta 38 px. Geist Mono alinea notas, referencias, horas y metadatos. Los WOFF2 1.8.1 se sirven con la aplicación y conservan su licencia. [Distribución oficial](https://github.com/vercel/geist-font/releases/tag/1.8.1) · [Licencia incluida](../public/fonts/LICENSE.txt)
- **Retícula.** Dos columnas ponderadas para índice, ocho para el documento y dos para el inspector. A 1120 px el índice pasa arriba. A 928 px el inspector sigue al contenido. A 624 px la comparación apila las versiones. Las acciones y referencias disponen de 44 px de alto.

## Pantallas y arquitectura

- **Capture.** Documento de una sola columna, acciones directas, muestras A1–A3 y estado del análisis local. La altura se ajusta al viewport para mostrar ambas acciones en 1366 × 768.
- **Review.** Original seleccionable de solo lectura junto a la copia editable. Las anotaciones marginales enfocan la línea original y las exclusiones permanecen visibles junto a la aprobación. El inspector distingue preparación, aprobación, revocación, elegibilidad e inferencia reportada.
- **Handoff.** Un documento de cuatro secciones numeradas. La fuente del SDK y el estado de revisión ocupan la cabecera. El botón de copia requiere las cuatro secciones y la confirmación humana. Un fallo de portapapeles deja el texto seleccionable.

Los componentes están en `src/editorial/`. `useIncidentWorkspace` mantiene la sesión y la revocación. La navegación conserva el borrador y guía el foco al título de la nueva etapa. Las solicitudes y sus respuestas siguen pasando por los adaptadores y las validaciones existentes. Los tokens aplicados están en [tokens.css](../src/editorial/tokens.css) y el inventario en [tokens.json](../design/tokens.json).

[QA y capturas de la implementación](EDITORIAL-QA.md)
