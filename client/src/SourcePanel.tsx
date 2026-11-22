import type { Source } from "./api";

type Props = { sources: Source[]; activeId: string | null };

function getPreviewText(snippet: string) {
  return snippet.replace(/^#{1,6}[ \t]+/gm, "");
}

export default function SourcePanel({ sources, activeId }: Props) {
  if (!sources.length) return null;
  return (
    <aside className="sources-section" aria-labelledby="sources-heading">
      <h2 id="sources-heading">Sources</h2>
      {sources.map((s) => (
        <article
          key={s.id}
          id={`source-${s.id}`}
          className={`source-card ${activeId === s.id ? "active" : ""}`}
          tabIndex={0}
          aria-label={`Source ${s.id}: ${s.title}`}
        >
          <header className="source-header">
            <span className="type-chip">{s.type}</span>
            <div>
              <h3>{s.title}</h3>
              <p className="source-meta">{s.date} · Chunk {s.id}</p>
            </div>
          </header>
          <div className="preview">
            <p className="preview-label">Preview</p>
            <p className="preview-text">{getPreviewText(s.snippet)}</p>
          </div>
        </article>
      ))}
    </aside>
  );
}