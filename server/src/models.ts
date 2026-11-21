import "dotenv/config";

const res = await fetch(`${process.env.LLM_BASE_URL}/models`, {
  headers: { authorization: `Bearer ${process.env.LLM_API_KEY}` },
});
if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
const data = (await res.json()) as any;
for (const m of data.data) console.log(m.id);