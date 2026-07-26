# StoreFlow Project Structure

```text
.
├── app.json
├── package.json
├── tsconfig.json
├── .gitignore
├── README.md
├── SPEC.md
├── STRUCTURE.md
├── assets/
│   ├── icon.png
│   ├── adaptive-icon.png
│   └── splash.png
├── app/
│   ├── _layout.tsx
│   └── (tabs)/
│       ├── _layout.tsx
│       ├── index.tsx
│       ├── metadata.tsx
│       ├── listing.tsx
│       ├── review.tsx
│       ├── checklist.tsx
│       └── validate.tsx
├── components/
│   ├── ChecklistRow.tsx
│   ├── FormField.tsx
│   ├── ReadinessCard.tsx
│   ├── Screen.tsx
│   ├── SectionCard.tsx
│   ├── ScreenshotPicker.tsx
│   └── ValidationRow.tsx
├── constants/
│   ├── categories.ts
│   ├── checklist.ts
│   └── theme.ts
├── context/
│   └── SubmissionContext.tsx
├── hooks/
│   └── useSubmission.ts
├── lib/
│   ├── exportSubmissionPackage.ts
│   ├── storage.ts
│   └── validation.ts
└── types/
    └── submission.ts
```

The legacy static web prototype files (`run.sh`, `server.py`, `index.html`, `styles.css`, and `app.js`) are removed and replaced by this native Expo project.
