import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { SubmissionDraft, ValidationResult } from '@/types/submission';
export async function exportSubmissionPackage(draft: SubmissionDraft, validation: ValidationResult) {
 const payload = { generatedAt: new Date().toISOString(), product: 'StoreFlow', localReadiness: validation, draft };
 const uri = `${FileSystem.cacheDirectory}storeflow-submission-${Date.now()}.json`;
 await FileSystem.writeAsStringAsync(uri, JSON.stringify(payload, null, 2), { encoding: FileSystem.EncodingType.UTF8 });
 if (await Sharing.isAvailableAsync()) { await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: 'Share submission package' }); }
 return uri;
}
