import type { Source } from "./api";

type Props = {
  answer: string;
  sources: Source[];
  activeId: string | null;
  onSelect: (id: string) => void;
};

export default function AnswerView({ answer, sources, activeId, onSelect }: Props) {
  const sourceIds = new Set(sources.map((source) => source.id));
  const parts = answer.split(/(\[[A-Z]+-\d+#\d+\])/g);
  return (
    <div className="answer-text">
      {parts.map((part, i) => {
        const m = part.match(/^\[([A-Z]+-\d+#\d+)\]$/);
        if (!m) return <span key={i}>{part}</span>;
        const id = m[1]!;
        if (!sourceIds.has(id)) return <span key={i}>{part}</span>;
        return (
          <button
            key={i}
            type="button"
            className={`citation ${activeId === id ? "active" : ""}`}
            onClick={() => onSelect(id)}
            aria-label={`View source ${id}`}
          >
            {id}
          </button>
        );
      })}
    </div>
  );
}