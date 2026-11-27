# Abrir Relay para revisar y grabar

## Candidatas conservadas

| Uso | Rama | SHA de aplicación |
| --- | --- | --- |
| Incremento nocturno | design/night-20261127-review-clarity | b5c7a8f4c814e6523609be281ed4e17daa7ba660 |
| Base editorial anterior | design/lotos-editorial-v2 | f795eaaf28a2ff38db6b701b4d4fd3ce5470c109 |
| Base técnica integrada | main | de573fb6b909b0ea23422cfab6342d227490be95 |

Los commits posteriores en la rama nocturna añaden documentación y evidencia; consultar el head del PR para su SHA final.

## Instrucción para Codex local

Trabajar con el repositorio exacto `https://github.com/Adal612Git/relay`. Verificar el remote, los cambios locales y los worktrees antes de hacer nada. No descartar cambios, mover ramas existentes ni desplegar.

El historial documenta un worktree `C:\Users\Rick\Documents\LotosTechnologies\RelayByLotos-editorial`, con configuración local y origen `http://localhost:4174/`. Su existencia y estado actual deben comprobarse en la computadora. Esta ronda no tuvo acceso al disco Windows.

### Revisar sin pisar el trabajo existente

```powershell
$relayRepo = 'C:\Users\Rick\Documents\LotosTechnologies\RelayByLotos'
$relayNight = 'C:\Users\Rick\Documents\LotosTechnologies\RelayByLotos-night-20261127'
git -C $relayRepo remote get-url origin
git -C $relayRepo status --short
git -C $relayRepo worktree list
git -C $relayRepo fetch origin
git -C $relayRepo worktree add --detach $relayNight origin/design/night-20261127-review-clarity
git -C $relayNight rev-parse HEAD
```

Si el destino ya existe, inspeccionarlo y elegir otro directorio nuevo; no eliminarlo ni forzar la operación. Si la rama remota ha avanzado, leer primero su registro y comparar el SHA.

Un worktree nuevo no incluye archivos de entorno ignorados. Antes del build AI, Codex debe localizar y reutilizar únicamente la configuración local del proyecto que ya funcionaba, sin mostrar sus valores, publicarlos en Git ni sustituir archivos existentes. Revisar los nombres `.env`, `.env.local`, `.env.production` y `.env.production.local` y la precedencia documentada del proyecto. No inventar configuración, debilitar App Check ni presentar el recorrido manual como AI.

```powershell
Set-Location $relayNight
npm ci
npm run typecheck
npm test
npm run build
npm run preview -- --host localhost --port 4174 --strictPort
```

El último comando permanece abierto sirviendo la vista. Si 4174 está ocupado, identificar el proceso y el build que sirve antes de detener nada. No cambiar de origen suponiendo que App Check seguirá preparado.

### Comprobación de inferencia real antes de la toma

Usar el perfil Chrome ya preparado y el origen4174. El historial registra un perfil dedicado `%TEMP%\relay-chrome-v4-xscvbwz0`; comprobar que siga existiendo. No abrir un perfil limpio suponiendo que el modelo ya se descargó o que la atestación funcionará.

Desde otra terminal, con el preview abierto y el perfil de pruebas libre:

```powershell
Set-Location $relayNight
$env:RELAY_INTEGRATION_BASE_URL = 'http://localhost:4174'
$env:RELAY_CHROME_MODEL_V4 = '1'
$env:RELAY_CHROME_TEST_PROFILE = Join-Path $env:TEMP 'relay-chrome-v4-xscvbwz0'
npm run test:integration
```

Estos son los comandos del entorno histórico, no una afirmación de que esa configuración siga disponible. Si falla el gate, registrar el error y conservar la versión actual; no tocar autenticación o lógica para obtener un resultado aparente.

## Secuencia visible correcta

**A1 → Analyze locally → Review/exclusiones → Approve this text → Open handoff → Generate handoff → revisar cuatro campos → Review complete → Copy handoff → Clear incident.**

Esperar resultados reales. Describir únicamente la fuente que la app muestra, on-device o cloud. [Guion actualizado de2:40](../../../DEMO-SCRIPT.md).

Prepare manually sirve para ensayar el recorrido si AI está bloqueada. Identificarlo como ensayo manual. El preview público documentado en el tablero continúa siendo RC1 y no es evidencia de esta rama editorial.

