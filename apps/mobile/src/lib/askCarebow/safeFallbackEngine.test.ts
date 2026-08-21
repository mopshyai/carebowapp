import { createEmptyHealthContext, type HealthContext } from '@/types/askCarebow';
import { processSafeFallbackUserInput } from './safeFallbackEngine';

describe('safe Ask CareBow fallback intake', () => {
  it('asks for the main symptom when the opener is vague', async () => {
    const response = await processSafeFallbackUserInput(
      "I'm feeling sick.",
      'initial',
      createEmptyHealthContext(),
      []
    );

    expect(response.phaseUpdate).toBe('gathering');
    expect(response.messages).toHaveLength(1);
    expect(response.messages[0].text).toContain('main symptom');
  });

  it('does not mistake a duration number for a severity score', async () => {
    const response = await processSafeFallbackUserInput(
      'I have a headache for 2 days',
      'initial',
      createEmptyHealthContext(),
      []
    );

    expect(response.healthContextUpdates?.duration).toBe('1_2_days');
    expect(response.healthContextUpdates?.severity).toBeUndefined();
    expect(response.questionAsked).toBe('severity');
  });

  it('requires main symptom, duration, severity and associated symptoms before guidance', async () => {
    let context: HealthContext = createEmptyHealthContext();

    const start = await processSafeFallbackUserInput("I'm feeling sick.", 'initial', context, []);
    expect(start.messages[0].text).toContain('main symptom');

    const symptom = await processSafeFallbackUserInput('I have a headache', 'gathering', context, []);
    context = { ...context, ...symptom.healthContextUpdates };
    expect(symptom.questionAsked).toBe('duration');
    expect(context.primarySymptom).toContain('headache');

    const duration = await processSafeFallbackUserInput('two days', 'gathering', context, ['duration']);
    context = { ...context, ...duration.healthContextUpdates };
    expect(duration.questionAsked).toBe('severity');
    expect(context.duration).toBe('1_2_days');

    const severity = await processSafeFallbackUserInput('6', 'gathering', context, [
      'duration',
      'severity',
    ]);
    context = { ...context, ...severity.healthContextUpdates };
    expect(severity.questionAsked).toBe('associated_symptoms');
    expect(context.severity).toBe(6);

    const associated = await processSafeFallbackUserInput('Some nausea', 'gathering', context, [
      'duration',
      'severity',
      'associated_symptoms',
    ]);

    expect(associated.phaseUpdate).toBe('guidance');
    expect(associated.messages).toHaveLength(1);
    expect(associated.messages[0].text).toContain('Urgency:');
    expect(associated.messages[0].text).toContain('Possible explanations');
    expect(associated.messages[0].text).toContain('What to do now');
    expect(associated.messages[0].text).toContain('Monitor:');
    expect(associated.messages[0].text).toContain('Get urgent help if:');
    expect(associated.messages[0].text).toContain('CareBow next step:');
  });

  it('re-asks an unparseable duration instead of fabricating a default', async () => {
    const context: HealthContext = {
      ...createEmptyHealthContext(),
      primarySymptom: 'headache',
    };

    const response = await processSafeFallbackUserInput('not sure', 'gathering', context, [
      'duration',
    ]);

    expect(response.questionAsked).toBe('duration');
    expect(response.healthContextUpdates?.duration).toBeUndefined();
    expect(response.messages[0].text).toContain('rough timeframe');
  });

  it('still bypasses intake immediately for an emergency signal', async () => {
    const response = await processSafeFallbackUserInput(
      'I have severe chest pain and trouble breathing',
      'initial',
      createEmptyHealthContext(),
      []
    );

    expect(response.urgencyLevel).toBe('emergency');
    expect(response.messages.some(message => message.isEmergency)).toBe(true);
  });
});
