import { embed } from "./embed.js";
import { loadIndex, topK } from "./retrieve.js";

const q = process.argv.slice(2).join(" ");
const index = await loadIndex();
const hits = topK(await embed(q), index, 5);
for (const { c, score } of hits) {
  console.log(score.toFixed(3), c.id, c.title);
}