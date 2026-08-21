import { createAskCarebowTurnRequestId } from './turnRequestId';

describe('Ask CareBow turn request id', () => {
  it('matches the server idempotency contract', () => {
    const requestId = createAskCarebowTurnRequestId(1_777_777_777_777);
    expect(requestId.length).toBeGreaterThanOrEqual(8);
    expect(requestId.length).toBeLessThanOrEqual(128);
    expect(requestId).toMatch(/^[A-Za-z0-9_.:-]+$/);
  });

  it('creates a fresh id for a new turn', () => {
    expect(createAskCarebowTurnRequestId()).not.toBe(createAskCarebowTurnRequestId());
  });
});
