---
id: CHAT-012
type: chat
title: "Internal sync decision: permit guarded manual refresh"
date: 2026-07-28
---

# Internal sync decision: permit guarded manual refresh

Channel: #sync-workers

Tavin Reed (10:00): The prototype now takes a per-source lease and deduplicates repeated refresh requests. Nightly work uses the same path.
Sora Pell (10:03): D-17 originally excluded manual refresh because overlapping runs were unsafe. That original reason is now addressed in the prototype design.
Mira Venn (10:06): Reverse the nightly-only restriction in policy under D-29, recorded today in DOC-013, because the concurrency guard supports serialized refresh requests. Keep nightly batches as the default.
Fenna Orr (10:09): Approval still needs crash and lease-expiry tests before rollout. A prototype observation is not production evidence.
Tavin Reed (10:12): TCK-007 will adopt the revised scope tomorrow; TCK-014 will track recovery tests.
Sora Pell (10:15): D-18 is unchanged. Refresh can update permitted fields but must never clear a Pulse suppression.
