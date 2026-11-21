import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { embed } from "../src/embed.js";
import { loadIndex, topK } from "../src/retrieve.js";
import { answerQuestion, MIN_SCORE } from "../src/answer.js";

const ansScores: number[] = [];
const unScores: number[] = [];

type Q = { q: string; expected: string[] };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const full = process.argv.includes("--full");
const label = process.argv.find((a) => a.startsWith("--label="))?.split("=")[1] ?? "run";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const questions = JSON.parse(
  await readFile(path.join(__dirname, "questions.json"), "utf8")
) as Q[];
const index = await loadIndex();

let answerable = 0, hit3 = 0, falseRefusals = 0;
let unanswerable = 0, correctRefusals = 0;
let fullAnswered = 0, fullCitedExpected = 0, fullCorrectRefusals = 0;
const failures: string[] = [];

for (const item of questions) {
  const hits = topK(await embed(item.q), index, 5);
  const top = hits[0]?.score ?? 0;
  const isAnswerable = item.expected.length > 0;

  if (isAnswerable) {
    (isAnswerable ? ansScores : unScores).push(top);
    answerable++;
    const hit = hits.slice(0, 3).some((h) => item.expected.includes(h.c.docId));
    if (hit) hit3++;
    else failures.push(`MISS  top=${top.toFixed(3)}  ${item.q}  -> got ${hits.slice(0, 3).map((h) => h.c.id).join(", ")}`);
    if (top < MIN_SCORE) {
      falseRefusals++;
      failures.push(`FALSE REFUSAL  top=${top.toFixed(3)}  ${item.q}`);
    }
  } else {
    unanswerable++;
    if (top < MIN_SCORE) correctRefusals++;
    else failures.push(`NOT REFUSED  top=${top.toFixed(3)}  ${item.q}`);
  }

  if (full) {
    const r = await answerQuestion(item.q);
    if (isAnswerable) {
      if (!r.refused) fullAnswered++;
      if (r.sources.some((s) => item.expected.includes(s.id.split("#")[0]!))) fullCitedExpected++;
    } else if (r.refused) fullCorrectRefusals++;
    await sleep(12000); // avoiding rate limit
  }
}

const pct = (n: number, d: number) => (d ? ((100 * n) / d).toFixed(1) : "n/a");
const result = {
  label,
  date: new Date().toISOString(),
  threshold: MIN_SCORE,
  questions: questions.length,
  hitAt3: `${hit3}/${answerable} (${pct(hit3, answerable)}%)`,
  falseRefusalRate: `${falseRefusals}/${answerable} (${pct(falseRefusals, answerable)}%)`,
  refusalAccuracy: `${correctRefusals}/${unanswerable} (${pct(correctRefusals, unanswerable)}%)`,
  ...(full && {
    fullAnswered: `${fullAnswered}/${answerable}`,
    fullCitedExpected: `${fullCitedExpected}/${answerable}`,
    fullCorrectRefusals: `${fullCorrectRefusals}/${unanswerable}`,
  }),
};

console.log("answerable top-1: min", Math.min(...ansScores).toFixed(3), "max", Math.max(...ansScores).toFixed(3));
console.log("unanswerable top-1: min", Math.min(...unScores).toFixed(3), "max", Math.max(...unScores).toFixed(3));

console.log(result);
console.log(failures.length ? "\nFailures:\n" + failures.join("\n") : "\nNo failures.");
await writeFile(path.join(__dirname, `results-${label}.json`), JSON.stringify({ result, failures }, null, 2));