import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Chunk } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../../data");
const MAX_WORDS = 180;
const OVERLAP_WORDS = 40;

function parseFrontMatter(raw: string) {
  const text = raw.replace(/\r\n/g, "\n");
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error("Missing front-matter");
  const meta: Record<string, string> = {};
  for (const line of m[1]!.split("\n")) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    const value = line.slice(i + 1).replace(/\s+#.*$/, "").trim();
    meta[key] = value;
  }
  return { meta, body: m[2]!.trim() };
}

export function chunkText(body: string): string[] {
  const units: string[][] = [];
  for (const p of body.split(/\n\s*\n/)) {
    const words = p.trim().split(/\s+/).filter(Boolean);
    for (let i = 0; i < words.length; i += MAX_WORDS) {
      units.push(words.slice(i, i + MAX_WORDS));
    }
  }
  const chunks: string[] = [];
  let current: string[] = [];
  let newWords = 0;
  for (const u of units) {
    if (current.length + u.length > MAX_WORDS && newWords > 0) {
      chunks.push(current.join(" "));
      current = current.slice(-OVERLAP_WORDS);
      newWords = 0;
    }
    current.push(...u);
    newWords += u.length;
  }
  if (newWords > 0) chunks.push(current.join(" "));
  return chunks;
}

export async function loadChunks(): Promise<Chunk[]> {
  const chunks: Chunk[] = [];
  for (const folder of ["docs", "tickets", "chats"]) {
    const dir = path.join(DATA_DIR, folder);
    for (const file of (await readdir(dir)).filter((f) => f.endsWith(".md"))) {
      const raw = await readFile(path.join(dir, file), "utf8");
      const { meta, body } = parseFrontMatter(raw);
      for (const f of ["id", "type", "title", "date"]) {
        if (!meta[f]) throw new Error(`${file}: missing ${f}`);
      }
      chunkText(body).forEach((text, i) => {
        chunks.push({
          id: `${meta.id}#${i + 1}`,
          docId: meta.id!,
          type: meta.type as Chunk["type"],
          title: meta.title!,
          date: meta.date!,
          text,
        });
      });
    }
  }
  return chunks;
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const chunks = await loadChunks();
  console.log(`Chunks: ${chunks.length}`);
  console.log(chunks.slice(0, 3));
}