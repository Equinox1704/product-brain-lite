import type { Source } from "./api";

type Props = { sources: Source[]; activeId: string | null };

export default function SourcePanel({ sources, activeId }: Props) {
  if (!sources.length) return null;
  return (
    <section>
      <h2>Sources</h2>
      {sources.map((s) => (
        <article key={s.id} className={`source ${activeId === s.id ? "active" : ""}`}>
          <header>
            <span className={`type ${s.type}`}>{s.type}</span>
            <strong>{s.title}</strong>
            <small>{s.id} · {s.date}</small>
          </header>
          <p>{s.snippet}…</p>
        </article>
      ))}
    </section>
  );
}