/**
 * Local feature flags.
 *
 * No remote flag/rollout infrastructure exists in this app yet (that's E10's
 * job — see carebow-main issue #57). Until then, a flag gate here is a local
 * constant: flip it to false to instantly revert to pre-E7 behavior without
 * touching the call sites that check it.
 */

// Gates ConversationScreen's Ask CareBow send path. When true, mobile talks
// only to the canonical CareBow chat backend. Local rewrite/engine output is
// not conversation truth.
export const ASK_CAREBOW_ORCHESTRATOR_ENABLED = true;
