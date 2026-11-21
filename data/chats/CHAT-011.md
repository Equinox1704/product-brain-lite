---
id: CHAT-011
type: chat
title: "Customer feedback: bounce warning mistaken for unsubscribe"
date: 2026-05-04
---

# Customer feedback: bounce warning mistaken for unsubscribe

Channel: #customer-notes

Iona Rell (15:00): Fictional customer Neva Orrel from Satin Grove thought a hard-bounce badge meant the recipient clicked unsubscribe.
Neri Vale (15:03): DOC-008 separates transport failure from preference changes. D-19 keeps a permanently unreachable address suppressed workspace-wide.
Elian Marr (15:06): DOC-009's unsubscribe receipt is for deliberate preference actions. We should not reuse that label for bounces.
Iona Rell (15:09): The customer asked whether moving the address to another audience would clear it.
Neri Vale (15:12): It must not, because another audience does not repair the destination. TCK-008 tests the workspace-wide boundary.
Elian Marr (15:15): I will keep the status explanations distinct; no change to unsubscribe scope is approved in this discussion.
