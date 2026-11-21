type Props = { answer: string; activeId: string | null; onSelect: (id: string) => void };

export default function AnswerView({ answer, activeId, onSelect }: Props) {
  const parts = answer.split(/(\[[A-Z]+-\d+#\d+\])/g);
  return (
    <p className="answer">
      {parts.map((part, i) => {
        const m = part.match(/^\[([A-Z]+-\d+#\d+)\]$/);
        if (!m) return <span key={i}>{part}</span>;
        const id = m[1]!;
        return (
          <button
            key={i}
            className={`badge ${activeId === id ? "active" : ""}`}
            onClick={() => onSelect(id)}
          >
            {id}
          </button>
        );
      })}
    </p>
  );
}