import { completeSSEFrames, parseSSEEventFrame } from './sseClient';

describe('completeSSEFrames', () => {
  it('returns no frames for an empty response so far', () => {
    expect(completeSSEFrames('')).toEqual([]);
  });

  it('returns every frame when the text ends with the blank-line separator', () => {
    expect(completeSSEFrames('data: {"a":1}\n\ndata: {"b":2}\n\n')).toEqual([
      'data: {"a":1}',
      'data: {"b":2}',
    ]);
  });

  it('excludes a still-arriving partial frame', () => {
    expect(completeSSEFrames('data: {"a":1}\n\ndata: {"b":2')).toEqual(['data: {"a":1}']);
  });

  it('is safe to call repeatedly as more text arrives, never re-splitting a complete frame', () => {
    const chunk1 = 'data: {"a":1}\n\nda';
    const chunk2 = 'data: {"a":1}\n\ndata: {"b":2}\n\n';
    expect(completeSSEFrames(chunk1)).toEqual(['data: {"a":1}']);
    expect(completeSSEFrames(chunk2)).toEqual(['data: {"a":1}', 'data: {"b":2}']);
  });
});

describe('parseSSEEventFrame', () => {
  it('parses the JSON payload of a data line', () => {
    expect(parseSSEEventFrame('data: {"type":"delta","text":"hi"}')).toEqual({
      type: 'delta',
      text: 'hi',
    });
  });

  it('returns null for a frame with no data line', () => {
    expect(parseSSEEventFrame('event: ping')).toBeNull();
  });

  it('returns null for invalid JSON rather than throwing', () => {
    expect(parseSSEEventFrame('data: not json')).toBeNull();
  });
});
