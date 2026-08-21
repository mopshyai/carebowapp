export type AskInputMode = 'text' | 'voice';

/**
 * The same patient text must drive validation, red-flag detection and the
 * conversation start action. Voice mode previously displayed one transcript
 * while safety checks read the unrelated text-input state.
 */
export function resolveAskInputText(
  mode: AskInputMode,
  typedText: string,
  recognizedVoiceText: string
): string {
  return mode === 'voice' ? recognizedVoiceText.trim() : typedText.trim();
}
