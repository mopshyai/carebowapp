/**
 * Minimal Server-Sent-Events client over XMLHttpRequest.
 *
 * Not fetch + response.body.getReader(): RN's fetch does not reliably expose
 * a streaming response body across iOS/Android/Hermes, whereas XHR's
 * onprogress + growing responseText is a long-standing, reliable way to read
 * a response as it arrives in React Native. This is otherwise a plain SSE
 * client (frames separated by a blank line, each carrying one `data: ` line
 * of JSON) — there is no reconnection, retry, or `event:`/`id:` field
 * support because the one server this talks to (carebow-main's
 * /api/chat/sessions/:id/messages) doesn't use them.
 */

/**
 * Splits accumulated SSE text into complete frames. The last element of a
 * split on the blank-line separator is always either the empty string (text
 * ends with the separator — every frame is complete) or a still-arriving
 * partial frame (text does not end with it yet) — either way it must be
 * dropped, which is what slice(0, -1) does in both cases.
 */
export function completeSSEFrames(fullText: string): string[] {
  return fullText.split('\n\n').slice(0, -1);
}

/** Parses one frame's `data: <json>` line. Returns null for a frame with no data line or invalid JSON. */
export function parseSSEEventFrame(frame: string): unknown | null {
  const line = frame.split('\n').find((l) => l.startsWith('data: '));
  if (!line) return null;
  try {
    return JSON.parse(line.slice('data: '.length));
  } catch {
    return null;
  }
}

export function postSSE(
  url: string,
  body: unknown,
  headers: Record<string, string>,
  onEvent: (event: unknown) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let processedCount = 0;

    const flush = (text: string) => {
      const frames = completeSSEFrames(text);
      for (let i = processedCount; i < frames.length; i++) {
        const event = parseSSEEventFrame(frames[i]);
        if (event) onEvent(event);
      }
      processedCount = frames.length;
    };

    xhr.open('POST', url);
    for (const [key, value] of Object.entries(headers)) {
      xhr.setRequestHeader(key, value);
    }

    xhr.onprogress = () => flush(xhr.responseText);
    xhr.onload = () => {
      // Every frame this server sends ends with its own blank-line
      // terminator, so the response is already complete here — this just
      // guards against a dropped final onprogress tick.
      flush(xhr.responseText.endsWith('\n\n') ? xhr.responseText : `${xhr.responseText}\n\n`);
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`SSE request failed with status ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error('SSE request failed'));

    xhr.send(JSON.stringify(body));
  });
}
