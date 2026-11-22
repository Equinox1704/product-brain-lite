import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLenis } from "lenis/react";
import { ask } from "./api";
import AnswerView from "./AnswerView";
import SourcePanel from "./SourcePanel";

const TYPES = ["doc", "ticket", "chat"];
const TYPE_LABELS: Record<string, string> = {
  doc: "Docs",
  ticket: "Tickets",
  chat: "Chats",
};
const SUGGESTIONS = [
  "Why was CSV export postponed?",
  "How are failed deliveries retried?",
  "What is the office Wi-Fi password?",
];

type AskVariables = { question: string; types: string[] };

export default function App() {
  const [draft, setDraft] = useState("");
  const [submittedQuestion, setSubmittedQuestion] = useState("");
  const [submittedTypes, setSubmittedTypes] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [answerEntranceKey, setAnswerEntranceKey] = useState(0);
  const composing = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lenis = useLenis();

  const mutation = useMutation({
    mutationFn: ({ question, types }: AskVariables) => ask(question, types),
    onSuccess: () => setAnswerEntranceKey((key) => key + 1),
  });

  const toggle = (type: string) =>
    setTypes((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type],
    );

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (composing.current || draft.trim().length < 3 || mutation.isPending) return;

    const question = draft.trim();
    setSubmittedQuestion(question);
    setSubmittedTypes(types);
    setActiveId(null);
    mutation.mutate({ question, types });
  };

  const retry = () => {
    if (!submittedQuestion || mutation.isPending) return;
    setActiveId(null);
    mutation.mutate({ question: submittedQuestion, types: submittedTypes });
  };

  const selectCitation = (id: string) => {
    setActiveId(id);
    requestAnimationFrame(() => {
      const card = document.getElementById(`source-${id}`);
      if (!card) return;

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reducedMotion) {
        card.scrollIntoView({ behavior: "auto", block: "start" });
      } else if (lenis) {
        lenis.scrollTo(card, { offset: -24, duration: 0.8 });
      } else {
        card.scrollIntoView({ behavior: "auto", block: "start" });
      }
      card.focus({ preventScroll: true });
    });
  };

  const fillSuggestion = (suggestion: string) => {
    setDraft(suggestion);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const showResults = mutation.isPending || mutation.isError || mutation.isSuccess;

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand">
          <img className="brand-logo" src="/logo_p_b.jpg" alt="Product Brain logo" />
          <div className="wordmark">Product Brain</div>
        </div>
        <div className="demo-label">Demo · fictional data</div>
      </header>

      <main className={showResults ? "main-results" : "main-initial"}>
        <section className={showResults ? "workspace" : "initial-cluster"} aria-label="Ask Product Brain">
          {!showResults && (
            <>
              <h1 className="hero-title">Why did we decide that?</h1>
              <p className="hero-copy">
                Search the decisions behind Pulse’s docs, tickets, and team discussions.
              </p>
            </>
          )}

          <form className="composer" onSubmit={submit}>
            <label className="sr-only" htmlFor="question">
              Question for the Pulse knowledge base
            </label>
            <textarea
              ref={textareaRef}
              id="question"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onCompositionStart={() => { composing.current = true; }}
              onCompositionEnd={() => { composing.current = false; }}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !composing.current
                ) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder="Ask about a product decision…"
              maxLength={500}
              rows={3}
            />

            <div className="composer-footer">
              <fieldset className="filters">
                <legend className="sr-only">Source types</legend>
                <span className="filter-help">
                  {types.length ? `${types.length} selected` : "No selection = all types"}
                </span>
                <div className="filter-options">
                  {TYPES.map((type) => (
                    <label className="filter-chip" key={type}>
                      <input
                        type="checkbox"
                        checked={types.includes(type)}
                        onChange={() => toggle(type)}
                      />
                      <span>{TYPE_LABELS[type]}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="submit-controls">
                <span className="character-count" aria-label={`${draft.length} of 500 characters`}>
                  {draft.length}/500
                </span>
                <button
                  type="submit"
                  className="ask-button"
                  disabled={mutation.isPending || draft.trim().length < 3}
                >
                  {mutation.isPending ? "Searching…" : "Ask"}
                </button>
              </div>
            </div>
          </form>

          {!showResults && (
            <div className="initial-extras">
              <p className="suggestion-label">Try a question</p>
              <div className="suggestions" aria-label="Suggested questions">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    type="button"
                    className="suggestion"
                    key={suggestion}
                    onClick={() => fillSuggestion(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <p className="demo-note">
                Demo searches fictional Pulse materials. No personal files are uploaded.
              </p>
            </div>
          )}

          <div className="status-live" aria-live="polite" aria-atomic="true">
            {mutation.isPending ? "Searching the corpus…" : ""}
            {mutation.isError ? `Request error: ${mutation.error.message}` : ""}
          </div>

          {mutation.isPending && (
            <section className="results" aria-label="Loading answer">
              <p className="loading-status">Searching the corpus…</p>
            </section>
          )}

          {mutation.isError && (
            <section className="results" aria-label="Answer error">
              <div className="error-card" role="alert">
                <p className="result-label">Error</p>
                <p className="error-question">Question: {submittedQuestion}</p>
                <p className="error-message">{mutation.error.message}</p>
                <button type="button" className="retry-button" onClick={retry}>
                  Retry
                </button>
              </div>
            </section>
          )}

          {mutation.isSuccess && (
            <section
              key={answerEntranceKey}
              className="results answer-entrance"
              aria-label="Answer results"
            >
              <div className="result-grid">
                <article className="answer-column">
                  <p className="result-label">Answer</p>
                  <p className="submitted-question">{submittedQuestion}</p>
                  {mutation.data.refused ? (
                    <p className="answer-text">
                      {mutation.data.answer ||
                        "No supported answer found in the retrieved fictional Pulse materials."}
                    </p>
                  ) : (
                    <AnswerView
                      answer={mutation.data.answer}
                      sources={mutation.data.sources}
                      activeId={activeId}
                      onSelect={selectCitation}
                    />
                  )}
                </article>
                {mutation.data.sources.length > 0 && (
                  <SourcePanel sources={mutation.data.sources} activeId={activeId} />
                )}
              </div>
            </section>
          )}
        </section>
      </main>

      <footer>Fictional corpus. Answers can be wrong—check the sources.</footer>
    </div>
  );
}
