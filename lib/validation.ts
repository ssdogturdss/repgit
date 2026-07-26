import { checklistItems } from '@/constants/checklist';
import { SubmissionDraft, ValidationIssue, ValidationResult } from '@/types/submission';
const https = (value: string) => { try { return new URL(value).protocol === 'https:'; } catch { return false; } };
const email = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export function validateDraft(d: SubmissionDraft): ValidationResult {
 const errors: ValidationIssue[] = []; const warnings: ValidationIssue[] = []; const err = (id:string,message:string)=>errors.push({id,severity:'error',message}); const warn=(id:string,message:string)=>warnings.push({id,severity:'warning',message});
 if (!d.appName.trim()) err('appName','Add an app name.');
 if (!/^[A-Za-z][A-Za-z0-9-]*(\.[A-Za-z][A-Za-z0-9-]*)+$/.test(d.bundleId)) err('bundleId','Use a reverse-domain bundle ID, such as com.company.app.');
 if (!d.sku.trim()) err('sku','Add an SKU.'); if (!d.primaryCategory) err('category','Choose a primary category.');
 if (!https(d.privacyPolicyUrl)) err('privacyUrl','Add a valid HTTPS privacy policy URL.'); if (!https(d.supportUrl)) err('supportUrl','Add a valid HTTPS support URL.');
 if (!/^\d+(\.\d+){1,3}$/.test(d.version)) err('version','Use a numeric dotted version, such as 1.0.0.'); if (!d.buildNumber.trim()) err('build','Add a build number.');
 if (d.description.trim().length < 20) err('description','Description must contain at least 20 characters.'); if (!d.keywords.trim()) err('keywords','Add keywords.'); else if (d.keywords.length > 100) err('keywordsLength','Keywords must be 100 characters or fewer.');
 if (!d.screenshots.length) err('screenshots','Attach at least one screenshot.'); if (!d.reviewContactName.trim()) err('contactName','Add an App Review contact name.'); if (!email(d.reviewContactEmail)) err('contactEmail','Add a valid App Review contact email.');
 checklistItems.filter(i=>i.required && !d.checklist[i.id]).forEach(i=>err(`checklist-${i.id}`,`Complete: ${i.title}.`));
 if (!d.marketingUrl.trim()) warn('marketing','No marketing URL has been added.'); if (d.promotionalText.length > 170) warn('promotional','Promotional text is longer than 170 characters.'); if (d.screenshots.length < 3) warn('screenshotCount','Three or more screenshots are recommended.'); if (!d.demoAccountInstructions.trim()) warn('demo','No demo account instructions added.'); if (!d.reviewerNotes.trim()) warn('notes','No reviewer notes added.');
 const total = 13 + checklistItems.filter(i=>i.required).length; const complete = total - errors.length; return { errors, warnings, readiness: Math.max(0, Math.round((Math.max(0, complete) / total) * 100)), requiredComplete: Math.max(0, complete), requiredTotal: total };
}
