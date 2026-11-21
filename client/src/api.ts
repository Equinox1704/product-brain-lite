export type Source = { id: string; title: string; type: string; date: string; snippet: string };
export type AskResponse = { answer: string; sources: Source[]; refused: boolean; topScore: number };

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export async function ask(question: string, types: string[]): Promise<AskResponse> {
  const res = await fetch(`${API}/api/ask`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ question, types: types.length ? types : undefined }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}