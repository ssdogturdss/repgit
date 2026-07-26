import { ChecklistItemId } from '@/types/submission';
export type ChecklistItem = { id: ChecklistItemId; title: string; description: string; required: boolean };
export const checklistItems: ChecklistItem[] = [
  { id: 'appRecord', title: 'App Store Connect record created', description: 'Create the matching app record with the correct bundle identifier.', required: true },
  { id: 'signedBuild', title: 'Signed build prepared', description: 'Archive and validate a production build in Xcode or approved CI.', required: true },
  { id: 'privacy', title: 'App Privacy answers reviewed', description: 'Confirm disclosures match the final app and SDKs.', required: true },
  { id: 'ageRating', title: 'Age rating completed', description: 'Complete the App Store Connect questionnaire.', required: true },
  { id: 'pricing', title: 'Pricing and availability set', description: 'Choose territories and availability.', required: true },
  { id: 'exportCompliance', title: 'Export compliance answered', description: 'Answer encryption/export questions for the uploaded build.', required: false }
];
