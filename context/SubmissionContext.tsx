import React, { createContext, useEffect, useMemo, useState } from 'react';
import { loadDraft, saveDraft } from '@/lib/storage';
import { validateDraft } from '@/lib/validation';
import { ChecklistItemId, SubmissionDraft } from '@/types/submission';
const blank = (): SubmissionDraft => ({ appName:'', bundleId:'', sku:'', primaryCategory:'', privacyPolicyUrl:'', supportUrl:'', marketingUrl:'', version:'1.0.0', buildNumber:'', releaseNotes:'', promotionalText:'', description:'', keywords:'', supportEmail:'', screenshots:[], documents:[], reviewContactName:'', reviewContactEmail:'', reviewContactPhone:'', demoAccountInstructions:'', reviewerNotes:'', checklist:{ appRecord:false, signedBuild:false, privacy:false, ageRating:false, pricing:false, exportCompliance:false }, updatedAt:new Date().toISOString() });
type Ctx = { draft: SubmissionDraft; hydrated: boolean; update: (patch: Partial<SubmissionDraft>) => void; toggleChecklist:(id:ChecklistItemId)=>void; reset:()=>void; validation: ReturnType<typeof validateDraft> };
export const SubmissionContext = createContext<Ctx | null>(null);
export function SubmissionProvider({ children }: React.PropsWithChildren) { const [draft,setDraft]=useState(blank); const [hydrated,setHydrated]=useState(false);
 useEffect(()=>{ loadDraft().then(value=>{if(value) setDraft({...blank(),...value,checklist:{...blank().checklist,...value.checklist}});}).catch(()=>{}).finally(()=>setHydrated(true)); },[]);
 const commit=(mutator:(current:SubmissionDraft)=>SubmissionDraft)=>setDraft(current=>{const next={...mutator(current),updatedAt:new Date().toISOString()}; if(hydrated) saveDraft(next).catch(()=>{}); return next;});
 const value=useMemo(()=>({ draft, hydrated, update:(patch:Partial<SubmissionDraft>)=>commit(c=>({...c,...patch})), toggleChecklist:(id:ChecklistItemId)=>commit(c=>({...c,checklist:{...c.checklist,[id]:!c.checklist[id]}})), reset:()=>commit(()=>blank()), validation:validateDraft(draft) }),[draft,hydrated]);
 return <SubmissionContext.Provider value={value}>{children}</SubmissionContext.Provider>;
}
