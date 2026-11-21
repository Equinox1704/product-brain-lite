---
id: CHAT-007
type: chat
title: "Internal import review: error summary is not a download"
date: 2026-03-27
---

# Internal import review: error summary is not a download

Channel: #import-design

Tavin Reed (10:00): Can we attach a rejected-row CSV to the preview? It would make cleanup convenient.
Sora Pell (10:03): D-16 in DOC-006 postpones that because custom attributes could escape through a second download path before authorization is sound.
Elian Marr (10:06): An authenticated summary can show row numbers and validation categories without building that endpoint.
Mira Venn (10:09): Keep the on-screen summary because it supports correction without bypassing the postponed download boundary. Do not reinterpret D-15 partial acceptance as approval for rejection files.
Tavin Reed (10:12): TCK-006 will include summary tests only. Subscriber CSV export remains a separate postponed feature under D-05.
