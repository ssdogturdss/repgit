# StoreFlow Architecture

## Purpose and boundaries

StoreFlow is an offline-first Expo mobile application for preparing an App Store release handoff. It is intentionally a **local readiness tool**, not an App Store Connect client. The client never receives Apple credentials, never signs an archive, and never claims a build was uploaded or submitted.

```
+------------------+        local AsyncStorage        +--------------------+
| Expo / iOS UI    | <------------------------------> | Submission draft   |
| Expo Router tabs |                                  | storeflow...v1     |
+--------+---------+                                  +--------------------+
         |
         | image / document picker
         v
+------------------+      URI + metadata only      +----------------------+
| Device media &   | ----------------------------> | Draft asset records  |
| document sources |                               | (no binary export)   |
+------------------+                               +----------+-----------+
                                                               |
                                                               | JSON export
                                                               v
                                                     +----------------------+
                                                     | Cache file + native   |
                                                     | share sheet           |
                                                     +----------------------+
```

## Navigation

Expo Router owns file-based routing. The root provider hydrates persisted data before screens consume it; tabs provide the primary workflow.

```
app/_layout.tsx
  |
  +-- SubmissionProvider
        |
        +-- app/(tabs)/_layout.tsx
              +-- index      Dashboard
              +-- metadata   App identity and release data
              +-- listing    Listing copy, screenshots, documents
              +-- review     App Review contact/instructions
              +-- checklist  Apple-side tasks
              +-- validate   Issues, export, handoff boundaries
```

## State and persistence

`SubmissionProvider` is the sole owner of mutable draft state. It performs optimistic in-memory updates, timestamps mutations, and persists asynchronously through a small storage adapter.

```
Screen -> useSubmission() -> SubmissionProvider -> saveDraft() -> AsyncStorage
                                  |
                                  +-> validateDraft(draft) -> derived result
```

### Design decisions

- **One versioned JSON draft:** A single `storeflow.submission-draft.v1` key is easy to migrate, clear, and export. Future migrations should read old versions and normalize missing fields before rendering.
- **Asset metadata only:** Screenshot/document files remain on device. Their URI and basic metadata are retained for UI and handoff context; JSON export intentionally excludes binary data to avoid unexpectedly large or sensitive packages.
- **Pure validation:** `lib/validation.ts` has no React or native dependencies, making rules deterministic and unit-testable.
- **No global networking layer:** The specified product has no server integration. Adding one must introduce authenticated transport, consent, retention policy, encryption, and error/retry semantics rather than silently repurposing local data.

## Validation and readiness

```
SubmissionDraft + canonical checklist definitions
                    |
                    v
             validateDraft()
              /           \
             v             v
      blocking errors    warnings
             \             /
              +-> readiness score
                     |
                     v
             Dashboard / Validate / Export
```

Errors block local readiness; warnings are advisory. The score communicates completion of local requirements only. It is not an Apple approval prediction.

## Export and sharing

`exportSubmissionPackage` serializes the draft and validation snapshot to a temporary JSON file using Expo FileSystem. If available, Expo Sharing opens the native share sheet.

```
Validate screen -> exportSubmissionPackage
                    -> cache/storeflow-submission-<timestamp>.json
                    -> Sharing.isAvailableAsync()
                    -> native share sheet (when supported)
```

The cache file can be regenerated at any time. A future audit feature should use app-private document storage and explicit deletion controls rather than retaining cache files indefinitely.

## Native configuration and icon policy

`app.json` contains Expo app identity, iOS bundle identifier, image-picker usage text, icon/adaptive-icon/splash paths, and router plugins. The committed asset paths are release placeholders and must be replaced with approved 1024×1024 app artwork and launch art before App Store distribution.

```
app.json
  +-- icon / splash assets
  +-- iOS bundle identifier + tablet support
  +-- NSPhotoLibraryUsageDescription
  +-- Expo Router, image-picker, document-picker plugins
```

The organization must replace the placeholder bundle ID with its registered Apple identifier and configure signing outside this repository.

## Release operations outside this codebase

```
StoreFlow local package
        |
        v
Human release owner
        |
        +--> Xcode / EAS / approved macOS CI -> signed archive
        +--> Xcode Organizer / Transporter / CI -> App Store Connect upload
        +--> App Store Connect -> metadata, privacy, compliance, review submission
```

These steps require access to a physical iPhone, Apple Developer credentials, signing material, and App Store Connect permissions. They cannot be executed or verified from a source-only workspace.

## Scalability path

- Keep domain types, validation, and export logic framework-independent.
- Add migrations in `lib/storage.ts` as draft schemas evolve.
- Split tab screens into feature folders only when each feature has multiple subcomponents/hooks.
- If backend synchronization is added, isolate it behind a repository interface and preserve the current offline local draft as the source of user-visible edit state.
- Add unit tests for validation/migrations and device E2E tests for picker, persistence, and share flows before expanding release-critical behavior.
