---
id: CHAT-008
type: chat
title: "Customer feedback: repaired source data needs a fresh sync"
date: 2026-06-30
---

# Customer feedback: repaired source data needs a fresh sync

Channel: #customer-notes

Iona Rell (13:00): Fictional customer Rovin Eska from Amber Loom corrected source attributes at noon and asked why Pulse would wait until night.
Sora Pell (13:03): D-17 chose nightly runs because the initial worker lacked a per-source concurrency guard. DOC-007 states that reason explicitly.
Iona Rell (13:06): He wants a refresh button, not another CSV upload. His source has revision identifiers.
Tavin Reed (13:09): That belongs to subscriber sync, not DOC-006's one-time audience import. We can test a lease and duplicate-request key.
Mira Venn (13:12): Gather concurrency evidence before updating policy because a fast refresh that overwrites newer data would be worse than a clear wait.
Iona Rell (13:15): I will describe it as a request under review, not an available feature.
