import "dotenv/config";
import { embed } from "./embed.js";
import { loadIndex, topK } from "./retrieve.js";
import type { Chunk } from "./types.js";

const MIN_SCORE = 0.3;
const K = 5;
const NOT_FOUND = "I can't find that in the documents.";
const UNVERIFIED = "I couldn't produce a verifiable, cited answer for that.";

export type Source = { id: string; title: string; type: string; date: string; snippet: string };
export type Answer = { answer: string; sources: Source[]; refused: boolean; topScore: number };
type Hit = { c: Chunk; score: number };

let index: Chunk[] | null = null;

async function callLLM(system: string, user: string): Promise<string> {
  const res = await fetch(`${process.env.LLM_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.LLM_MODEL,
      temperature: 0,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`LLM ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as any;
  return data.choices?.[0]?.message?.content ?? "";
}

async function generate(system: string, userMsg: string, hits: Hit[]) {
  const byId = new Map(hits.map((h) => [h.c.id, h.c.id]));
  const byDoc = new Map<string, string>();
  for (const h of hits) if (!byDoc.has(h.c.docId)) byDoc.set(h.c.docId, h.c.id);

  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await callLLM(
      system,
      attempt === 0
        ? userMsg
        : userMsg + "\n\nYour previous answer had no [id] citations. Rewrite it with citations."
    );
    const normalized = raw
        .replace(/<think>[\s\S]*?<\/think>/gi, "")
        .replace(/[\u2010-\u2015\u2212]/g, "-");
    const cited = new Set<string>();
    const answer = normalized
      .replace(/[\[(【]([^\]\)】]+)[\]\)】]/g, (m, inner: string) => {
        const ids = inner
          .split(/[,;]\s*/)
          .map((s) => byId.get(s.trim()) ?? byDoc.get(s.trim()))
          .filter((s): s is string => Boolean(s));
        if (!ids.length) return m;
        ids.forEach((id) => cited.add(id));
        return ids.map((id) => `[${id}]`).join("");
      })
      .trim();
    const refusal = /can'?t find|cannot find/i.test(answer) && cited.size === 0;
    if (cited.size > 0 || refusal) return { answer, cited, refusal };
  }
  return { answer: "", cited: new Set<string>(), refusal: false };
}

export async function answerQuestion(question: string, types?: string[]): Promise<Answer> {
  index ??= await loadIndex();
  const pool = types?.length ? index.filter((c) => types.includes(c.type)) : index;
  const hits = topK(await embed(question), pool, K) as Hit[];
  const topScore = hits[0]?.score ?? 0;
  if (topScore < MIN_SCORE) {
    return { answer: NOT_FOUND, sources: [], refused: true, topScore };
  }

  const system =
    "You answer questions using ONLY the sources below.\n" +
    "Cite sources inline as [id] immediately after each claim, using the exact id with ASCII hyphens, e.g. [DOC-003#1].\n" +
    "Do not add a separate sources list and do not quote the sources verbatim.\n" +
    `If the sources do not contain the answer, reply exactly: ${NOT_FOUND}\n` +
    "Do not use outside knowledge.";

  const sourcesText = hits.map((h) => `[${h.c.id}] ${h.c.text}`).join("\n\n");
  const userMsg =
    `SOURCES:\n${sourcesText}\n\nQUESTION: ${question}\n\n` +
    `Answer in 2-5 sentences. End EVERY sentence with the id of the source it came from in square brackets, ` +
    `e.g. "Export was postponed because field-level access is not enforced [DOC-003#1]." ` +
    `Only use ids from the SOURCES list. If the sources do not answer the question, reply exactly: ${NOT_FOUND}`;

  const r = await generate(system, userMsg, hits);
  if (r.refusal) return { answer: NOT_FOUND, sources: [], refused: true, topScore };
  if (r.cited.size === 0) return { answer: UNVERIFIED, sources: [], refused: true, topScore };

  const sources: Source[] = hits
    .filter((h) => r.cited.has(h.c.id))
    .map((h) => ({
      id: h.c.id,
      title: h.c.title,
      type: h.c.type,
      date: h.c.date,
      snippet: h.c.text.slice(0, 240),
    }));
  return { answer: r.answer, sources, refused: false, topScore };
}