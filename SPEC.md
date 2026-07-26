# StoreFlow — Production Specification

## Product
StoreFlow is an offline-first iOS release-readiness companion. It replaces the previous browser prototype with an Expo React Native application that lets a release manager create and persist App Store submission data, attach local screenshots and documents, complete a release checklist, validate a local package, and export/share a JSON handoff file.

## Delivery boundary
The app does **not** sign binaries, authenticate to Apple, upload builds, access App Store Connect, or submit an app for review. Those operations require an Apple Developer account, App Store Connect permissions, signing credentials, macOS/Xcode or approved CI, and an authorized human operator. The application labels its completion state as **Ready to hand off**, never as submitted or approved.

## Stack
- Expo SDK 52+, React Native, TypeScript (strict)
- Expo Router v4 file-based routing
- React Native `StyleSheet`
- AsyncStorage for persistent local draft state
- `expo-image-picker` for screenshot selection
- `expo-document-picker` for document selection
- `expo-file-system` for export creation
- `expo-sharing` for native share sheet
- `@expo/vector-icons` for navigation and controls

## Core flows
1. Dashboard displays readiness score, required-field progress, checklist progress, and local warnings.
2. Metadata form captures identity, URLs, version/build and release notes.
3. Listing form captures copy, keywords, screenshot assets, and optional supporting documents.
4. Review form captures reviewer contacts, demo account instructions, and review notes.
5. Checklist persists required/optional release tasks.
6. Validate screen displays blocking errors and warnings, then exports a local JSON package through the platform share sheet.
7. Handoff guidance explicitly documents the remaining Apple-side actions.

## Persistent model
The draft is saved at `storeflow.submission-draft.v1`. Every edit updates memory immediately and is written asynchronously. Asset records contain only local URI and metadata; export includes asset metadata rather than image/document bytes.

## Validation
Blocking errors:
- App name, SKU, category, build number, review contact name, and review contact email required.
- Bundle ID matches reverse-domain syntax.
- Privacy policy and support URLs are valid HTTPS URLs.
- Version follows numeric dotted notation.
- Description has at least 20 characters.
- Keywords are present and at most 100 characters.
- At least one screenshot exists.
- All required checklist items are checked.

Warnings:
- Marketing URL omitted.
- Promotional text exceeds 170 characters.
- Fewer than three screenshots.
- Demo instructions or reviewer notes omitted.

Readiness is based on complete required fields and checklist requirements; errors force a non-ready status.

## Native iOS configuration
`app.json` configures iOS bundle identifier `com.synthetic.solutions.storeflow`, tablet support, app icon, adaptive icon, splash image, usage descriptions for photo library access, and Expo plugins. Production distribution must replace the placeholder identifier and visual assets with organization-approved values before signing.

## Real-device and App Store delivery procedure
These steps cannot be completed from this workspace and require access to Apple hardware/accounts:
1. Install dependencies and run `npx expo start`; open with Expo Go or a development build on a physical iPhone.
2. Verify forms persist after force quit, photo/document pickers function, validation changes, and JSON share sheet opens.
3. Configure EAS/Xcode signing with the real Apple Developer team and release bundle identifier.
4. Create a signed archive/build, test it on a physical device, and upload through Xcode Organizer, Transporter, or approved CI.
5. In App Store Connect complete listing copy, device screenshots, privacy questionnaire, age rating, pricing, territories, export compliance, URLs, review contact, review notes, and build selection.
6. Submit the selected processed build for Apple review and monitor App Store Connect for messages.

## Acceptance criteria
- `npm install` then `npx expo start` runs the project.
- All routes render with TypeScript strict mode enabled.
- Draft and checklist survive an app restart.
- Screenshot and document selection handle permission/cancel states safely.
- Validation blocks local handoff readiness for required omissions.
- Export writes and shares a JSON package when sharing is available.
- Product copy never asserts a real Apple upload or review submission occurred.
