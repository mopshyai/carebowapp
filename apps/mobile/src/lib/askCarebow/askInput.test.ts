import { resolveAskInputText } from './askInput';

describe('Ask CareBow effective input', () => {
  it('uses the recognized transcript in voice mode even when the text field is empty', () => {
    expect(resolveAskInputText('voice', '', '  severe chest pain  ')).toBe('severe chest pain');
  });

  it('does not let stale typed text override a newer voice transcript', () => {
    expect(resolveAskInputText('voice', 'mild headache', 'difficulty breathing')).toBe(
      'difficulty breathing'
    );
  });

  it('uses typed input in text mode', () => {
    expect(resolveAskInputText('text', '  fever since yesterday ', 'old voice text')).toBe(
      'fever since yesterday'
    );
  });
});
