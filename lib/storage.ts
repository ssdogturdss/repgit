import AsyncStorage from '@react-native-async-storage/async-storage';
import { SubmissionDraft } from '@/types/submission';
export const STORAGE_KEY = 'storeflow.submission-draft.v1';
export const loadDraft = async (): Promise<SubmissionDraft | null> => { const value = await AsyncStorage.getItem(STORAGE_KEY); return value ? JSON.parse(value) : null; };
export const saveDraft = (draft: SubmissionDraft) => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
