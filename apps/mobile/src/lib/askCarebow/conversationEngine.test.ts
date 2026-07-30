import { processUserInput } from './conversationEngine';
import { createEmptyHealthContext } from '@/types/askCarebow';

/**
 * Covers the intent-routing wiring added for E12 — classifyIntent() itself is
 * tested in intentClassifier.test.ts, this checks that processUserInput
 * actually uses it: talk/want_doctor/want_test short-circuit the usual
 * onset/location/severity question sequence, and a plain symptom report still
 * goes through it exactly as before.
 */
describe('processUserInput intent routing (initial phase)', () => {
  it('routes a "just want to talk" message into the talking phase, not symptom gathering', async () => {
    const response = await processUserInput(
      'I just want to talk',
      'initial',
      createEmptyHealthContext(),
      []
    );
    expect(response.phaseUpdate).toBe('talking');
    expect(response.messages[0].contentType).toBe('text');
  });

  it('routes a "see a doctor" message straight to service_routing with a video_consult recommendation', async () => {
    const response = await processUserInput(
      'I want to see a doctor',
      'initial',
      createEmptyHealthContext(),
      []
    );
    expect(response.phaseUpdate).toBe('service_routing');
    expect(response.serviceRecommendations?.[0].serviceId).toBe('video_consult');
  });

  it('routes a "get a test" message straight to service_routing with a lab_test recommendation', async () => {
    const response = await processUserInput(
      'I want to book a lab test',
      'initial',
      createEmptyHealthContext(),
      []
    );
    expect(response.phaseUpdate).toBe('service_routing');
    expect(response.serviceRecommendations?.[0].serviceId).toBe('lab_test');
  });

  it('still routes a plain symptom report into the gathering phase', async () => {
    const response = await processUserInput(
      'I have had a headache since this morning',
      'initial',
      createEmptyHealthContext(),
      []
    );
    expect(response.phaseUpdate).toBe('gathering');
    expect(response.messages[0].contentType).toBe('question');
  });

  it('an emergency message short-circuits intent classification entirely', async () => {
    const response = await processUserInput(
      'I have severe chest pain and I want to talk',
      'initial',
      createEmptyHealthContext(),
      []
    );
    // The safety gate always runs first — a message that both sounds like
    // wanting to talk AND contains a red-flag symptom must never be routed
    // into supportive listening instead of the emergency flow.
    expect(response.phaseUpdate).not.toBe('talking');
  });
});

describe('processUserInput in the talking phase', () => {
  it('stays in talking mode for another emotional message', async () => {
    const response = await processUserInput(
      "I'm still feeling really anxious",
      'talking',
      createEmptyHealthContext(),
      []
    );
    expect(response.phaseUpdate).toBe('talking');
  });

  it('exits talking mode when the patient pivots to wanting a doctor', async () => {
    const response = await processUserInput(
      'actually can you connect me to a doctor',
      'talking',
      createEmptyHealthContext(),
      []
    );
    expect(response.phaseUpdate).toBe('service_routing');
  });

  it('exits talking mode into symptom gathering when a real symptom comes up', async () => {
    const response = await processUserInput(
      'actually my head has been hurting all day',
      'talking',
      createEmptyHealthContext(),
      []
    );
    expect(response.phaseUpdate).toBe('gathering');
  });
});
