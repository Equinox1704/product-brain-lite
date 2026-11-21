---
id: CHAT-013
type: chat
title: "Internal delivery review: do not merge bounce and opt-out states"
date: 2026-08-11
---

# Internal delivery review: do not merge bounce and opt-out states

Channel: #deliverability-review

Elian Marr (09:00): Could a single “inactive” badge cover hard bounces and unsubscribes to simplify the audience table?
Neri Vale (09:03): That would hide why sending stopped. DOC-008 and D-19 treat a hard bounce as a delivery failure, not a recipient preference.
Mira Venn (09:06): Keep separate labels because support needs to explain different causes and cannot suggest a preference change fixes an unreachable address.
Fenna Orr (09:09): TCK-008 already tests distinct event types. Merging display state would undermine those explanations.
Elian Marr (09:12): I withdraw the combined-label proposal. Publication unsubscribe scope still follows DOC-004 at this date; no later policy approval is implied.
