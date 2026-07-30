/**
 * Local feature flags.
 *
 * No remote flag/rollout infrastructure exists in this app yet (that's E10's
 * job — see carebow-main issue #57). Until then, a flag gate here is a local
 * constant: flip it to false to instantly revert to pre-E7 behavior without
 * touching the call sites that check it.
 */

// Gates ConversationScreen's symptom-help path: when true, that branch calls
// the mobile-auth'd orchestrator (E5/E7) instead of the rewrite-only endpoint,
// falling back to the rewrite-only behavior on any error.
export const ASK_CAREBOW_ORCHESTRATOR_ENABLED = true;
