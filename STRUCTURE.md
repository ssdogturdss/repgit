# LaunchPilot File Structure

## Repository Inventory

```text
.
├── SPEC.md          # Authoritative production product specification and acceptance criteria
├── STRUCTURE.md     # Authoritative file inventory and responsibility map
├── README.md        # Local run instructions, diagnostics, and real Apple-side handoff guidance
├── run.sh           # Bash launcher: validates configuration, checks port, starts/stops server
├── server.py        # Python standard-library static SPA server with local security headers
├── index.html       # Accessible single-page application shell and mount regions
├── styles.css       # Responsive dark operations-console design system and accessibility styles
└── app.js           # Client application: state, routes, local workflows, rendering, persistence, UI actions
```

## File Responsibilities

### `SPEC.md`

Defines LaunchPilot’s product behavior, explicit external-integration boundary, user workflows, state model, technical architecture, security expectations, and acceptance criteria.

### `STRUCTURE.md`

Lists every file in the repository and describes each file’s responsibility. Any future repository addition, removal, or rename must be reflected here and in `SPEC.md`.

### `README.md`

Documents prerequisites, startup commands, optional environment variables, common diagnostics, browser-local persistence, and the operator-owned process for actual App Store Connect/TestFlight delivery.

### `run.sh`

The supported Bash entry point. It validates that it is running under Bash, checks loopback host and valid port settings, verifies Python availability, detects occupied ports, launches `server.py`, optionally opens a browser, and handles clean shutdown.

### `server.py`

A dependency-free Python 3 static server rooted at the repository directory. It serves application assets, prevents path traversal, supports SPA fallback behavior, sets no-cache and baseline security headers, and never makes outbound requests.

### `index.html`

Defines the semantic document shell, primary navigation region, application content mount point, toast live region, modal mount point, stylesheet import, and application script import. It contains no external asset or third-party script reference.

### `styles.css`

Implements responsive layout, color tokens, typography, navigation, cards, tables, badges, workflow timelines, notices, modal behavior, toast feedback, mobile behavior, and keyboard focus visibility.

### `app.js`

Owns all browser-side behavior:

- Seed-state creation and local-storage validation/persistence.
- Hash-route parsing and route rendering.
- Project/build lookup and readiness derivation.
- Build-plan approval.
- Local workflow creation, timed progression, cancellation, and retry.
- Active-workflow recovery after refresh.
- Project, build, TestFlight, connections, settings, activity, and modal rendering.
- Checklist generation, Clipboard API copy, and textarea fallback copy.
- Accessible toast messages and delegated event handling.

## Runtime Boundaries

The repository intentionally has no package manifest, framework runtime, external CDN asset, or dependency installation step. Its only runtime requirements are Bash and Python 3. All app state is stored in the operator’s browser local storage; no application network API exists.
