export interface JournalPrompt {
  id: string
  category: 'gratitude' | 'storytelling' | 'reflection' | 'identity'
  text: string
  identity_type?: string
}

export const JOURNAL_PROMPTS: JournalPrompt[] = [
  // gratitude
  { id: 'g1', category: 'gratitude', text: 'Name 10 things you\'re grateful for today.' },
  { id: 'g2', category: 'gratitude', text: 'What small moment today deserved more appreciation?' },
  { id: 'g3', category: 'gratitude', text: 'Who made your day better and how?' },

  // storytelling
  { id: 's1', category: 'storytelling', text: 'What happened today that you could tell as a story?' },
  { id: 's2', category: 'storytelling', text: 'Describe a moment today where you surprised yourself.' },
  { id: 's3', category: 'storytelling', text: 'What\'s one thing that happened today you\'d want to remember in 10 years?' },

  // reflection
  { id: 'r1', category: 'reflection', text: 'How did you show up today for your goals?' },
  { id: 'r2', category: 'reflection', text: 'What would you do differently if you lived today again?' },
  { id: 'r3', category: 'reflection', text: 'What drained your energy today and what gave it back?' },

  // identity (general)
  { id: 'i1', category: 'identity', text: 'What did you do today that your future self would be proud of?' },
  { id: 'i2', category: 'identity', text: 'What belief about yourself did you challenge today?' },

  // identity-aware: Athlete
  { id: 'a1', category: 'identity', text: 'How did your body feel during training today?', identity_type: 'Athlete' },
  { id: 'a2', category: 'identity', text: 'What physical win did you have this week, however small?', identity_type: 'Athlete' },

  // identity-aware: Entrepreneur
  { id: 'e1', category: 'identity', text: 'What problem did you make progress on today?', identity_type: 'Entrepreneur' },
  { id: 'e2', category: 'identity', text: 'What distracted you from deep work and how will you guard against it tomorrow?', identity_type: 'Entrepreneur' },

  // identity-aware: Monk
  { id: 'm1', category: 'identity', text: 'Where did you find stillness today?', identity_type: 'Monk' },
  { id: 'm2', category: 'identity', text: 'What thought pattern did you observe in yourself today?', identity_type: 'Monk' },
]

export function getPromptById(id: string): JournalPrompt | undefined {
  return JOURNAL_PROMPTS.find(p => p.id === id)
}

export function getPromptsForIdentities(identityNames: string[]): JournalPrompt[] {
  const normalizedNames = identityNames.map(n => n.toLowerCase())
  return JOURNAL_PROMPTS.filter(p =>
    !p.identity_type || normalizedNames.some(n => n.includes(p.identity_type!.toLowerCase()) || p.identity_type!.toLowerCase().includes(n))
  )
}
