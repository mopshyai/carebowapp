export function createAskCarebowTurnRequestId(now = Date.now()): string {
  const random = Math.random().toString(36).slice(2, 12);
  return `ask_${now.toString(36)}_${random}`;
}
