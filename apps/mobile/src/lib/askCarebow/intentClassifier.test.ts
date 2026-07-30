import { classifyIntent } from './intentClassifier';

describe('classifyIntent', () => {
  it('defaults to symptom_help for a plain symptom report', () => {
    expect(classifyIntent('I have a headache since this morning')).toBe('symptom_help');
    expect(classifyIntent('my stomach hurts')).toBe('symptom_help');
  });

  it('defaults to symptom_help for empty input', () => {
    expect(classifyIntent('')).toBe('symptom_help');
    expect(classifyIntent('   ')).toBe('symptom_help');
  });

  describe('want_doctor', () => {
    it.each([
      'I want to see a doctor',
      'can you connect me to a doctor',
      'I need to book a doctor appointment',
      'I want a teleconsult',
      'can I speak to a physician',
    ])('%s -> want_doctor', (text) => {
      expect(classifyIntent(text)).toBe('want_doctor');
    });
  });

  describe('want_test', () => {
    it.each([
      'I want to get a blood test',
      'can I book a lab test',
      'I need to get tested for covid',
      'I want some lab work done',
    ])('%s -> want_test', (text) => {
      expect(classifyIntent(text)).toBe('want_test');
    });
  });

  describe('talk', () => {
    it.each([
      'I just want to talk',
      'I need someone to talk to',
      'can we just chat',
      "I'm feeling really anxious lately",
      'im feeling so overwhelmed',
      'I need to vent',
    ])('%s -> talk', (text) => {
      expect(classifyIntent(text)).toBe('talk');
    });
  });

  describe('mixed emotional + physical language never classifies as talk', () => {
    it.each([
      "I'm so stressed and my chest hurts",
      'feeling anxious, also have a fever',
      "I'm overwhelmed and nauseous",
    ])('%s -> symptom_help, not talk', (text) => {
      expect(classifyIntent(text)).toBe('symptom_help');
    });
  });
});
