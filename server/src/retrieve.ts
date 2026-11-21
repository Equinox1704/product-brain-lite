import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Chunk } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function loadIndex(): Promise<Chunk[]> {
  const p = path.resolve(__dirname, "../data/index.json");
  return JSON.parse(await readFile(p, "utf8")) as Chunk[];
}

function dot(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i]! * b[i]!;
  return s;
}

export function topK(queryVec: number[], chunks: Chunk[], k = 5) {
  return chunks
    .map((c) => ({ c, score: dot(queryVec, c.embedding!) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}