import {
  normalizeIntentForAppRouting,
  shouldRouteThroughSharedOrchestrator,
} from './orchestratorRouting';

const response = (intent: 'talk' | 'want_doctor' | 'want_test' | 'symptom_help' | 'emergency') => ({
  messages: [],
  intent,
});

describe('mobile Ask CareBow orchestrator routing', () => {
  it.each(['symptom_help', 'want_doctor', 'want_test', 'talk'] as const)(
    'routes non-emergency %s turns through the shared orchestrator',
    (intent) => {
      expect(shouldRouteThroughSharedOrchestrator(response(intent))).toBe(true);
      expect(normalizeIntentForAppRouting(response(intent)).intent).toBe('symptom_help');
    }
  );

  it('keeps deterministic emergency handling out of the normal orchestrator gate', () => {
    const emergency = { ...response('emergency'), isEmergency: true };
    expect(shouldRouteThroughSharedOrchestrator(emergency)).toBe(false);
    expect(normalizeIntentForAppRouting(emergency).intent).toBe('emergency');
  });
});
