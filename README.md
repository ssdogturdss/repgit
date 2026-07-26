# StoreFlow

StoreFlow is an Expo React Native release-readiness workspace for assembling a local App Store submission handoff package. It persists form data on-device, selects screenshots/documents, validates a checklist, and shares a JSON package.

## Run

```bash
npm install
npx expo start
```

Open the QR code with Expo Go or a development build on a physical iPhone. For strict release validation:

```bash
npm run typecheck
```

## Apple release boundary

This application does not sign, upload, or submit an app to Apple. A real release requires Apple Developer/App Store Connect access, a signed build, and a human-operated upload/review workflow through Xcode, Transporter, or approved CI.

See `SPEC.md` for exact product scope and the physical-device/App Store Connect delivery procedure.
