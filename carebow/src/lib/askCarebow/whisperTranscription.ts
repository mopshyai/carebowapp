/**
 * Whisper Transcription Service
 * Uses OpenAI's Whisper API for speech-to-text transcription
 */

const OPENAI_API_URL = 'https://api.openai.com/v1/audio/transcriptions';

export type TranscriptionResult = {
  text: string;
  success: boolean;
  error?: string;
};

/**
 * Gets MIME type for audio file extension
 */
function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    'm4a': 'audio/m4a',
    'mp3': 'audio/mpeg',
    'mp4': 'audio/mp4',
    'mpeg': 'audio/mpeg',
    'mpga': 'audio/mpeg',
    'wav': 'audio/wav',
    'webm': 'audio/webm',
    'ogg': 'audio/ogg',
    'flac': 'audio/flac',
  };

  return mimeTypes[extension] || 'audio/m4a';
}

/**
 * Alternative transcription using fetch with uri directly (for React Native)
 * This is a simpler approach that works better with expo-av recordings
 */
export async function transcribeAudioNative(
  audioUri: string,
  apiKey: string
): Promise<TranscriptionResult> {
  try {
    if (!apiKey) {
      return {
        text: '',
        success: false,
        error: 'OpenAI API key not configured',
      };
    }

    // For React Native, we need to use a different approach
    // Create multipart form data manually
    const formData = new FormData();

    // Get file extension
    const extension = audioUri.split('.').pop()?.toLowerCase() || 'm4a';
    const mimeType = getMimeType(extension);

    // Append file with proper format for React Native
    formData.append('file', {
      uri: audioUri,
      type: mimeType,
      name: `audio.${extension}`,
    } as any);

    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        // Don't set Content-Type - fetch will set it with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP error ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData?.error?.message || errorMessage;
      } catch {
        // Use default error message
      }
      return {
        text: '',
        success: false,
        error: errorMessage,
      };
    }

    const data = await response.json();

    return {
      text: data.text?.trim() || '',
      success: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      text: '',
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Mock transcription for development/testing without API key
 */
export async function mockTranscribeAudio(
  _audioUri: string,
  durationMs: number
): Promise<TranscriptionResult> {
  // Simulate processing time based on audio duration
  await new Promise(resolve => setTimeout(resolve, Math.min(durationMs / 2, 2000)));

  // Return a mock result
  const mockResponses = [
    "I've had a headache for the past two days",
    "My stomach has been hurting since this morning",
    "I feel very tired and have a slight fever",
    "I noticed a rash on my arm yesterday",
  ];

  const randomIndex = Math.floor(Math.random() * mockResponses.length);

  return {
    text: mockResponses[randomIndex],
    success: true,
  };
}
