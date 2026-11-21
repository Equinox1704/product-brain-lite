---
id: CHAT-014
type: chat
title: "Internal reporting review: reminder is not emailed attachment"
date: 2026-07-09
---

# Internal reporting review: reminder is not emailed attachment

Channel: #reporting-design

Fenna Orr (16:00): The review reminder could attach a cached campaign PDF. Should we reuse the scheduler's stored access result?
Sora Pell (16:03): No. Access might change before delivery, and the scheduler cannot revalidate attachment permissions. D-27 in DOC-012 postpones that path.
Mira Venn (16:06): Reject the attachment shortcut because a prior permission check is not proof of current access. Keep the in-app reminder proposal only.
Elian Marr (16:09): Opening its link will check report access at that time. The reminder itself contains no subscriber data.
Fenna Orr (16:12): TCK-013 will close the shortcut. This also does not prove that TCK-004's PDF work has shipped.
