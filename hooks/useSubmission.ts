import { useContext } from 'react';
import { SubmissionContext } from '@/context/SubmissionContext';
export function useSubmission() { const context = useContext(SubmissionContext); if (!context) throw new Error('useSubmission must be used inside SubmissionProvider'); return context; }
