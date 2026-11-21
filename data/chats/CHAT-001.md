---
id: CHAT-001
type: chat
title: "Activation triage: email delivery is not checklist progress"
date: 2026-02-06
---

# Activation triage: email delivery is not checklist progress

Channel: #activation-lab
Thread date: 2026-02-06

- 09:10 — Iona Rell: Fictional pilot customer Junia Kest from Lantern Finch says the welcome email arrived, but the setup panel still asks her to import an audience.
- 09:12 — Elian Marr: That is expected unless an import succeeded. DOC-002 measures actual setup actions, not email receipt.
- 09:14 — Tavin Reed: TCK-001 controls the email sequence. TCK-002 controls checklist visibility. They share events but not completion rules.
- 09:17 — Mira Venn: D-10: We kept email engagement out of checklist completion because opening instructions does not demonstrate successful setup.
- 09:20 — Iona Rell: Junia confirmed she only read the guide. I will explain the remaining import step rather than file a progress bug.
- 09:23 — Elian Marr: TCK-002 is done, but that only establishes per-user dismissal and action-derived completion. It says nothing about the email worker's release state.
