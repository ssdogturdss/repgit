export type AssetRecord = { id: string; uri: string; name: string; mimeType?: string; size?: number; selectedAt: string };
export type ChecklistItemId = 'appRecord' | 'signedBuild' | 'privacy' | 'ageRating' | 'pricing' | 'exportCompliance';
export type SubmissionDraft = {
  appName: string; bundleId: string; sku: string; primaryCategory: string; privacyPolicyUrl: string; supportUrl: string; marketingUrl: string; version: string; buildNumber: string; releaseNotes: string;
  promotionalText: string; description: string; keywords: string; supportEmail: string;
  screenshots: AssetRecord[]; documents: AssetRecord[];
  reviewContactName: string; reviewContactEmail: string; reviewContactPhone: string; demoAccountInstructions: string; reviewerNotes: string;
  checklist: Record<ChecklistItemId, boolean>; updatedAt: string;
};
export type ValidationIssue = { id: string; severity: 'error' | 'warning'; message: string };
export type ValidationResult = { errors: ValidationIssue[]; warnings: ValidationIssue[]; readiness: number; requiredComplete: number; requiredTotal: number };
