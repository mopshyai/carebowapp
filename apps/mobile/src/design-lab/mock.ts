/**
 * Static mocked family + Ask CareBow states.
 * No network, payments, analytics, or clinical inference.
 * Safety copy is labeled as server-owned.
 */

export type LabPerson = {
  id: 'you' | 'mom' | 'dad' | 'grandma';
  name: string;
  initial: string;
  relationship: string;
};

export const PEOPLE: LabPerson[] = [
  { id: 'you', name: 'You', initial: 'Y', relationship: 'Self' },
  { id: 'mom', name: 'Mom', initial: 'M', relationship: 'Mother' },
  { id: 'dad', name: 'Dad', initial: 'D', relationship: 'Father' },
  { id: 'grandma', name: 'Grandma', initial: 'G', relationship: 'Grandmother' },
];

export const HISTORY: Record<LabPerson['id'], { when: string; title: string }[]> = {
  you: [
    { when: 'Yesterday', title: 'Sore throat overnight' },
    { when: 'Aug 4', title: 'Travel pharmacy question' },
  ],
  mom: [
    { when: 'Today', title: 'Fatigue since yesterday' },
    { when: 'Aug 31', title: 'Medication question' },
    { when: 'Aug 18', title: 'Follow-up after visit' },
  ],
  dad: [
    { when: 'Sep 2', title: 'Blood pressure reading' },
    { when: 'Jul 12', title: 'Sleep and energy' },
  ],
  grandma: [
    { when: 'Aug 22', title: 'Dizziness while standing' },
    { when: 'Jun 9', title: 'Appointment prep' },
  ],
};

export const UNDERSTOOD = {
  mom: [
    { label: 'Unusually tired since yesterday', source: 'reported' as const },
    { label: 'Takes a daily blood-pressure medicine', source: 'known' as const },
    { label: 'Any chest pain, fainting, or new confusion?', source: 'question' as const },
  ],
};

export const SERVER_SAFETY = {
  title: 'Seek urgent in-person evaluation today',
  body: 'Server-owned safety state. Displayed as received — not inferred from this chat’s wording.',
  actionLabel: 'Call emergency services',
};

export const SERVER_NEXT_STEP = {
  kind: 'care' as const,
  title: 'A clinician should see Mom today',
  body: 'Same-day in-home evaluation is available in your area. CareBow does not diagnose from this conversation.',
  actionLabel: 'See available care',
  secondaryActions: ['Keep monitoring at home', 'Message the care team'],
};

export const UPCOMING = {
  when: 'Thu · 4:30 PM',
  title: 'Video visit with Dr. Rao for chronic-care follow-up',
  person: 'Mom',
};

export const STARTERS = [
  'I’ve felt unusually tired since yesterday.',
  'What should I watch for overnight?',
  'Help me decide if this needs a visit.',
];
