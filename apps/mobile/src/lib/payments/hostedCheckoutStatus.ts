import type { PaymentStatusResponse } from '../../services/api/endpoints/payments';

export type HostedCheckoutDecision = 'paid' | 'failed' | 'pending';

/**
 * Decide what the public client may safely tell the family after returning from
 * hosted checkout. Processor capture alone is not enough for custom care: the
 * backend may still reject confirmation because the quote/request/profile access
 * changed and then refund the charge.
 */
export function classifyHostedCheckoutStatus(
  response: PaymentStatusResponse
): HostedCheckoutDecision {
  if (response.status === 'FAILED' || response.status === 'REFUNDED') {
    return 'failed';
  }

  if (response.status !== 'SUCCESS') return 'pending';

  if (response.kind !== 'care_request') return 'paid';

  const careStatus = response.careRequest?.status;
  const careConfirmed = careStatus === 'CONFIRMED' || careStatus === 'COMPLETED';

  // Newer servers expose resolutionRequired/processorStatus explicitly. The
  // CareRequest state check also protects the app when talking to an older or
  // partially deployed server that returns processor SUCCESS too early.
  if (response.resolutionRequired || !careConfirmed) return 'pending';

  return 'paid';
}
