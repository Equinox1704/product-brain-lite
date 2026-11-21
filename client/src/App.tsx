import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ask } from "./api";
import AnswerView from "./AnswerView";
import SourcePanel from "./SourcePanel";

const TYPES = ["doc", "ticket", "chat"];

export default function App() {
  const [question, setQuestion] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const mutation = useMutation({ mutationFn: () => ask(question, types) });

  const toggle = (t: string) =>
    setTypes((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveId(null);
    mutation.mutate();
  };

  return (
    <main>
      <h1>Product Brain Lite</h1>
      <p className="sub">Ask questions about the Pulse documents. Answers cite their sources.</p>

      <form onSubmit={submit}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Why was the export feature postponed?"
          maxLength={500}
        />
        <button type="submit" disabled={mutation.isPending || question.trim().length < 3}>
          {mutation.isPending ? "Searching…" : "Ask"}
        </button>
      </form>

      <div className="filters">
        {TYPES.map((t) => (
          <label key={t}>
            <input type="checkbox" checked={types.includes(t)} onChange={() => toggle(t)} />
            {t}
          </label>
        ))}
      </div>

      {mutation.isError && <p className="error">{mutation.error.message}</p>}
      {mutation.isIdle && <p className="empty">Try a question to get started.</p>}

      {mutation.data && (
        <>
          <AnswerView answer={mutation.data.answer} activeId={activeId} onSelect={setActiveId} />
          {mutation.data.refused && (
            <p className="empty">No supported answer found in the documents.</p>
          )}
          <SourcePanel sources={mutation.data.sources} activeId={activeId} />
        </>
      )}
    </main>
  );
}