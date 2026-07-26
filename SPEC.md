# LaunchPilot — Production Product Specification

## 1. Product Summary

LaunchPilot is a **local-first iOS delivery planning console**. It allows an operator to inspect project compatibility, approve a build plan, run a **real local workflow simulation**, persist all workflow state in the browser, and prepare an accurate human-operated TestFlight handoff.

The application is intentionally not an Apple delivery client. It does not compile imported projects, sign binaries, contact Apple, upload archives, create credentials, or submit releases. Every UI surface must state this boundary where a user could otherwise infer a real external delivery action.

## 2. User Request Interpretation

The requirement “Everything must work no simulations” is implemented as follows:

- Every visible application workflow is functional in the browser: navigation, plan approval, build creation, build status progression, cancellation, retry, persistence, reset, project selection, checklist generation, clipboard fallback, and App Store Connect handoff.
- The application must not fake integration with Apple or build infrastructure. It must never claim a simulated build is a signed IPA, an Apple upload, or a TestFlight-ready release.
- Local workflow execution is represented truthfully as an **in-browser local lifecycle demonstration**. It is not a simulation of an external integration; it is the actual supported local product behavior.
- All unavailable real-world actions are clearly delegated to the operator, including Xcode/CI build execution, signing, App Store Connect upload, Apple processing, beta review, and tester invitation.

## 3. Goals

1. Provide a reliable responsive delivery-planning workspace.
2. Let users inspect seeded project readiness and delivery blockers.
3. Let eligible project plans be approved and saved locally.
4. Let users create, track, cancel, and retry local workflow runs.
5. Persist all application state across refreshes using browser local storage.
6. Produce a project-specific, copyable, practical TestFlight handoff checklist.
7. Make Apple-side authorization and delivery responsibilities unmistakable.
8. Operate with no runtime dependencies and no outbound application network calls.

## 4. Non-Goals and Truthfulness Constraints

LaunchPilot must not:

- Compile, inspect, execute, package, or upload project source code.
- Claim that a browser-local workflow run creates an archive, IPA, certificate, provisioning profile, or signed artifact.
- Contact App Store Connect, Apple Developer, OAuth providers, CI platforms, or any third-party API.
- Request, store, transmit, display, or derive Apple credentials, private keys, certificates, provisioning profiles, or API keys.
- Submit an app, invite testers, begin Beta App Review, or publish a release.
- Label a local workflow completion as an Apple/TestFlight completion.

A user-initiated external navigation to App Store Connect is allowed. It must open a new tab with `target="_blank" rel="noopener noreferrer"`.

## 5. Product Terminology

| Term | Meaning |
| --- | --- |
| Build plan | The locally stored delivery plan and approval decision for a project. |
| Local workflow run | A browser-local status workflow that demonstrates delivery coordination. No code is executed. |
| Local completion | The terminal status of a local workflow run; it does not represent Apple delivery. |
| Handoff ready | A project has compatible planning status and an approved plan, so the operator can proceed with the real Apple-side process. |
| Apple authorization | Always human-controlled and external to this application. |

The terminal local status is `LOCAL_WORKFLOW_COMPLETE`; the product must not use `TESTFLIGHT_READY` as a status name because that could be interpreted as an external Apple result.

## 6. User Experience Requirements

### 6.1 Application Shell

- Responsive single-page web application with a dark operations-console visual system.
- Desktop layout includes persistent navigation; compact layouts expose mobile navigation.
- Minimum supported viewport width is 320 px.
- Semantic heading hierarchy, accessible button labels, keyboard-visible focus styles, and `aria-live` feedback are required.
- Routes are hash-based and must render directly after reload:
  - `#/overview`
  - `#/projects`
  - `#/projects/:id`
  - `#/builds`
  - `#/builds/:id`
  - `#/testflight`
  - `#/connections`
  - `#/settings`

### 6.2 Overview

The overview displays:

- Total projects.
- Projects that are handoff ready.
- Active local workflow runs.
- Completed local workflow runs.
- Recent local activity.
- A prominent “local-only workspace” disclosure.
- Direct navigation to TestFlight handoff instructions.

### 6.3 Projects

The projects page displays seeded project cards with:

- Project name and description.
- Source type and reference.
- Compatibility condition.
- Build-plan status.
- Latest local workflow state where present.
- A clear blocker for projects needing review.

Project detail displays:

- Source metadata.
- Delivery strategy.
- Requirements and risks.
- Compatibility explanation.
- Build-plan hash, generation date, and approval time when approved.
- Build-plan approval control when eligible and not approved.
- Start-local-workflow control when handoff-ready.
- Local workflow history.
- Link to the relevant TestFlight handoff guide.

### 6.4 Builds

The builds page lists every local workflow run with project, run number, state, and update time.

Build detail displays:

- An explicit local-only boundary notice.
- Lifecycle timeline.
- Timestamped event history.
- Cancel action while a run is active.
- Retry action for failed or cancelled runs.
- A completion message that explicitly confirms no Apple service was contacted.

Lifecycle states:

```text
QUEUED
→ CONFIGURING
→ BUILDING_PLAN
→ VALIDATING_PLAN
→ HANDOFF_PREPARED
→ LOCAL_WORKFLOW_COMPLETE
```

A local workflow advances automatically on an interval of 1.5–1.8 seconds. This is a real front-end state transition and persistence feature; it is never represented as code execution, build execution, upload progress, or Apple processing.

Terminal failure/cancellation states:

```text
FAILED
CANCELLED
```

### 6.5 TestFlight Handoff

The TestFlight page must:

- Show a high-priority notice that LaunchPilot has no Apple authorization or connection.
- Allow project selection.
- Compute planning/handoff readiness from compatibility and build-plan approval.
- Display local workflow completion separately from all Apple-side requirements.
- Explain internal and external testing paths.
- Generate a project-specific checklist.
- Copy the checklist using the Clipboard API when available.
- Provide a working fallback copy method for browsers without the Clipboard API.
- Provide an App Store Connect external link using safe new-tab attributes.

### 6.6 Connections

The connections page presents fixed, non-configurable integration boundaries.

It must make clear that:

- No OAuth is configured.
- No Apple connection exists.
- No signing or upload capability exists.
- No API request is performed by the application.

### 6.7 Settings

The settings page explains local storage behavior and external-delivery limitations. It includes a destructive reset action protected by a confirmation modal. Confirming reset restores exact seeded state and routes to the overview.

## 7. Seed Data

Initial state contains exactly three representative projects:

1. **Orbit Commerce** — compatible, a plan is awaiting approval, and no local run has started.
2. **Field Notes** — compatible, plan approved, with one completed local workflow run.
3. **Legacy Portal** — compatibility review required, plan blocked, with a failed historical local workflow record.

All data are demonstration data. The application does not import external projects.

## 8. State Model and Persistence

Persistence key: `launchpilot.local-demo.v2`.

```text
AppState
  version
  selectedProjectId
  selectedBuildId
  testFlightProjectId
  activity[]
  connections[]
  projects[]
    id
    name
    description
    source { type, reference, importedAt }
    compatibility
    compatibilityText
    strategy
    plan {
      status
      hash
      generatedAt
      approvedAt?
    }
    requirements[]
    risks[]
    builds[]
      id
      number
      state
      localOnly: true
      createdAt
      updatedAt
      events[]
        id
        state
        message
        timestamp
```

State requirements:

- State is read from local storage at initialization.
- Invalid, stale, or malformed stored state is discarded and replaced by seed state.
- Every mutation is persisted synchronously after mutation.
- Active runs resume from their saved state after refresh and continue progressing.
- Reset removes persisted state and restores a fresh seeded state.

## 9. Readiness Rules

```text
localPlanningReady =
  project.plan.status === 'APPROVED' &&
  project.compatibility !== 'NEEDS_REVIEW'

hasLocalWorkflowCompletion =
  project.builds contains state === 'LOCAL_WORKFLOW_COMPLETE'

appleDeliveryAuthorization = 'HUMAN_ACTION_REQUIRED'
```

`appleDeliveryAuthorization` is constant. No UI action, local state, route, or completed workflow run may change it.

## 10. Technical Architecture

This repository is an existing dependency-free static web application. The delivered implementation must preserve that architecture rather than introduce Expo, React Native, package managers, or external dependency installation.

### 10.1 Runtime Stack

- HTML5 for semantic structure.
- CSS3 for responsive design and interaction states.
- Vanilla JavaScript for routing, state, render functions, event delegation, local persistence, clipboard fallback, and lifecycle timers.
- Python 3 standard library for static hosting.
- Bash for launcher diagnostics and lifecycle handling.

### 10.2 Front-End Architecture

`app.js` owns the following modules/logical concerns:

1. Constants and seed-state factory.
2. Local storage load, validation, save, and reset functions.
3. Hash route parsing and route dispatch.
4. Project and build lookup helpers.
5. Readiness/status derivation helpers.
6. Mutation functions for approval, workflow start, cancellation, retry, and workflow progression.
7. Timer reconciliation for active local runs.
8. Page-specific rendering functions.
9. Shared component render helpers for notices, badges, cards, timeline rows, activity rows, and empty states.
10. Event delegation and user feedback/toast management.
11. Modal rendering and confirmation action handling.
12. Checklist generation and clipboard fallback.

No code may use `fetch`, `XMLHttpRequest`, WebSocket, EventSource, third-party SDKs, or external scripts/styles.

### 10.3 Server Architecture

`server.py` serves only repository-local static files with the Python standard library.

It must:

- Bind to `127.0.0.1` by default.
- Accept only a validated host and port supplied by the launcher.
- Serve `index.html`, `styles.css`, `app.js`, and documentation/local assets where applicable.
- Prevent path traversal.
- Return SPA fallback content for supported client-facing paths.
- Send no-cache headers to ensure current local application code is served.
- Send baseline security headers.
- Make no outbound request.

### 10.4 Launcher Architecture

`run.sh` must:

- Require Bash; direct users to run `./run.sh`, not `sh run.sh`.
- Accept `HOST` and `PORT` environment overrides.
- Restrict `HOST` to loopback values such as `127.0.0.1`, `localhost`, and `::1` as supported by server behavior.
- Validate `PORT` as an integer within 1–65535.
- Verify executable `python3` availability.
- Detect an occupied configured port before server launch.
- Capture server stdout/stderr into a temporary log.
- Show useful log output if startup fails.
- Print the working local URL after startup.
- Treat browser opening as optional and non-fatal; honor `NO_BROWSER=true`.
- Stop server process cleanly on interrupt and use documented exit codes.

## 11. Security and Privacy Requirements

- No credentials are accepted, stored, or displayed.
- No data leave the browser except user-controlled navigation to App Store Connect.
- Browser local storage is the only application persistence mechanism.
- Static server headers include at minimum `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, a restrictive Content Security Policy appropriate for self-hosted local assets, and cache prevention headers.
- App Store Connect is opened only from an explicit user activation.

## 12. File Inventory

The implementation contains exactly these repository files unless a future change explicitly updates this specification and `STRUCTURE.md`:

```text
SPEC.md
STRUCTURE.md
README.md
run.sh
server.py
index.html
styles.css
app.js
```

## 13. Acceptance Criteria

1. `chmod +x run.sh && ./run.sh` starts the application at `http://127.0.0.1:3000` when Python 3 and the port are available.
2. `NO_BROWSER=true ./run.sh` starts the server without attempting browser launch.
3. Invalid shell invocation, unavailable Python, invalid host/port, occupied port, and startup failure return actionable diagnostics.
4. Overview, projects, project detail, builds, build detail, TestFlight, connections, and settings routes render correctly.
5. Orbit Commerce’s plan can be approved and its local workflow can be started.
6. Local workflow states advance automatically, persist after refresh, and complete as `LOCAL_WORKFLOW_COMPLETE`.
7. Active workflows can be cancelled; failed and cancelled workflows can be retried.
8. All lifecycle pages clearly state that no source code is run and no Apple service is contacted.
9. TestFlight handoff distinguishes planning readiness, local workflow completion, and mandatory operator-controlled Apple actions.
10. Checklist copy works via the Clipboard API and a textarea-based fallback.
11. State survives refresh and can be restored to seed state only after explicit confirmation.
12. Application code makes no network request; the only external action is the user-initiated App Store Connect navigation.
