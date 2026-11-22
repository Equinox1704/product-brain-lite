# Product Brain Lite

A source-cited RAG assistant for understanding why a product team made a decision—not just finding documents that mention the topic.

[Live demo](https://product-brain-lite.vercel.app) · [Evaluation](#evaluation) · [Run locally](#run-locally)

Ask a question about Pulse, a fictional email-marketing product. The assistant retrieves relevant documents, tickets, and team discussions, then generates an answer with clickable citations. When it cannot find sufficient evidence, it can return a no-evidence response instead of inventing an answer.

This is a personal engineering project built on synthetic data. It does not connect to real Slack, Jira, or Confluence workspaces.

## See it in action

### Ask about a product decision

A minimal question interface with source-type filters and suggested questions.

![Product Brain initial screen with question composer and source filters](C:\Users\Mayank\Desktop\product-brain-lite\client\public\SS_1.png)

### Inspect an answer and its sources

This example asks why hard-bounce suppression is workspace-wide. The response cites retrieved material, and the evidence panel identifies the source type, title, date, chunk ID, and preview.

![Hard-bounce question answered with inline citations and document, ticket, and chat sources](C:\Users\Mayank\Desktop\product-brain-lite\client\public\SS_2.png)

### Handle information outside the corpus

The office Wi-Fi question returns “I can’t find that in the documents,” without fabricated credentials or source cards.

![Office Wi-Fi question receiving a no-evidence response](C:\Users\Mayank\Desktop\product-brain-lite\client\public\SS_3.png)

These screenshots illustrate individual interface states. They are not evidence of general answer accuracy or citation correctness.

## Why this project

Product knowledge is spread across plans, implementation tickets, and conversations. Similar wording does not necessarily mean two passages describe the same decision, and an early policy can differ from a later revision.

Product Brain Lite explores that problem with a deliberately small corpus containing dated decisions, reversals, and near-duplicate topics. The focus is on traceable answers, measurable retrieval, and honest failure analysis—not a production knowledge platform.

## What it does

- Searches across product documents, tickets, and chat threads.
- Filters retrieval by source type.
- Generates answers with clickable inline citations and selectable source previews.
- Applies a similarity threshold before language-model generation.
- Retries generation when no recognized citations are returned.
- Checks citation identifiers against retrieved chunks.
- Separates the editable question draft from the question that produced the current answer.
- Handles loading, API errors, retry, and no-evidence responses.
- Includes retrieval-only and full-pipeline evaluation scripts.

Citation checks verify source references, not whether every cited passage entails the associated claim.

## Architecture

```text
OFFLINE INDEXING

45 synthetic Markdown files
    → Parse metadata
    → Split into 180-word chunks
    → Generate local text embeddings
    → Save JSON vector index

QUESTION ANSWERING

React client
    → Express API: validate question and optional source-type filters
    → Embed question locally
    → Rank indexed chunks by dot-product similarity
    → Apply similarity threshold
        ├─ Below threshold → no-evidence response
        └─ Otherwise → provide top 5 chunks to hosted LLM
                         → check citation references
                         → return answer and source previews
```

The API uses a local embedding model for retrieval and a hosted model for answer generation. The implementation keeps the index in JSON rather than introducing a vector database for this small dataset.

### Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, TanStack Query |
| Interface | Custom CSS, Lenis smooth scrolling |
| Backend | Node.js, Express, Zod, express-rate-limit |
| Embeddings | `@xenova/transformers`, `all-MiniLM-L6-v2` |
| Retrieval | Dot-product search over normalized embeddings |
| Generation | OpenAI-compatible hosted API; deployed with Groq |
| Index | Local JSON file |
| Deployment | Vercel frontend, Render backend |

## Dataset

The corpus contains 45 synthetic Markdown files:

| Source type | Files |
|---|---:|
| Product documents | 15 |
| Tickets | 15 |
| Chat threads | 15 |

The material includes policy changes, dated decisions, overlapping terminology, and distinctions between planned, approved, and released work. All people, discussions, and product records in the corpus are fictional.

Try:

- “Why was CSV export postponed?”
- “How are failed deliveries retried?”
- “Why is hard-bounce suppression workspace-wide, even when unsubscribe handling can be publication-scoped?”
- “What is the office Wi-Fi password?”

The last question demonstrates absent information, not a security or permissions feature.

## Evaluation

The reviewed development baseline is `baseline-reviewed-v2`.

The set contains 23 questions: 18 labelled answerable and five labelled unanswerable. These questions were used during development; this is not an independent held-out benchmark.

### Retrieval results

| Metric | Result |
|---|---:|
| Document Hit@3 on answerable questions | 17/18 (94.4%) |
| Threshold false refusals on answerable questions | 0/18 |
| Threshold rejections of labelled-unanswerable questions | 1/5 |

Document Hit@3 counts a question as a hit if at least one expected source document appears among the three highest-ranked chunks. It does not measure complete evidence coverage, answer accuracy, or citation entailment.

The baseline uses 180-word chunks, text-only embeddings, and a similarity threshold of 0.3. Answer generation receives the top five chunks, while the retrieval metric examines the top three.

### Full-pipeline observations

A full-pipeline run recorded:

- 18/18 non-refusal responses for answerable questions.
- 4/5 automated refusal flags for questions labelled unanswerable.

Non-refusal is not equivalent to a correct answer. Manual review also found that the remaining labelled-unanswerable case correctly explained that no export release date had been committed. The phrase-based refusal detector marked it as a non-refusal, although it did not invent a date.

The threshold alone rejected only one of five labelled-unanswerable questions. This limits any claim that similarity gating reliably identifies absent information.

### Experiments and label review

| Configuration | Document Hit@3 | Threshold false refusals | Labelled-unanswerable threshold rejections |
|---|---:|---:|---:|
| 180 words, text only | 17/18 | 0/18 | 1/5 |
| 180 words, title prepended | 17/18 | 0/18 | 1/5 |
| 120 words, text only | 17/18 | 0/18 | 1/5 |

Neither tested change improved these metrics, so the simpler baseline was retained.

An initial 18/18 retrieval result used an overly broad expected-source label. Reviewing and correcting that label reduced the result to 17/18. A later review added another valid rationale source for the hard-bounce question, but that source remained outside the top three; the final baseline stayed at 17/18.

Manual review also found an imprecise claim-to-source attribution concerning publication-scoped unsubscribes. Recognized citation IDs therefore must not be presented as proof of factual support.

### Run evaluation

From `server/`:

```bash
npm run eval -- --label=my-run
npm run eval -- --full --label=my-full-run
```

Full-pipeline evaluation calls the hosted model and consumes provider quota. Results may vary with provider, model, and generation behavior.

## Run locally

### Prerequisites

- Node.js and npm compatible with the committed dependencies.
- An API key and available model from an OpenAI-compatible provider.
- Network access for the embedding model's initial download and hosted generation.

### 1. Clone and install

```bash
git clone https://github.com/Equinox1704/product-brain-lite.git
cd product-brain-lite

cd server
npm ci
cd ../client
npm ci
cd ..
```

### 2. Configure the backend

Create `server/.env`:

```env
LLM_API_KEY=your_api_key
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_MODEL=your_available_model_identifier
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
```

Choose a model available to your provider account. Never commit `.env`, expose the API key through a `VITE_` variable, or put it in browser code.

### 3. Start the API

The repository includes `server/data/index.json`. To rebuild it after changing the corpus, run `npm run ingest` from `server/`.

```bash
cd server
npm run dev
```

Check `http://localhost:3001/api/health` for:

```json
{"status":"ok"}
```

### 4. Start the frontend

In a second terminal, from the repository root:

```bash
cd client
npm run dev
```

Open the address printed by Vite. The local backend normally runs at `http://localhost:3001`. If needed, set `VITE_API_URL=http://localhost:3001` in `client/.env` and restart Vite. If Vite uses a different origin, update `CLIENT_ORIGIN` accordingly.

### 5. Frontend checks

From `client/`:

```bash
npm run build
npm run lint
```

## API

### `GET /api/health`

Returns the API's basic availability status. It is not a full retrieval or model-provider health check.

### `POST /api/ask`

Example request:

```json
{
  "question": "Why was CSV export postponed?",
  "types": ["doc", "ticket", "chat"]
}
```

Omit `types` to search all source types. Questions must contain 3–500 characters after trimming.

Responses include:

- `answer`: generated answer or no-evidence message.
- `sources`: source IDs, titles, types, dates, and previews.
- `refused`: whether the pipeline returned a refusal.
- `topScore`: highest retrieval similarity score, not a calibrated probability of correctness.

## Deployment

### Render: backend

| Setting | Value |
|---|---|
| Root directory | `server` |
| Build command | `npm ci --include=dev` |
| Start command | `npm start` |
| Health-check path | `/api/health` |

The current start script uses `tsx`, so the install command includes development dependencies.

Configure `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL`, and `CLIENT_ORIGIN` in Render. Let the platform supply `PORT`; the server binds to `0.0.0.0`.

### Vercel: frontend

| Setting | Value |
|---|---|
| Root directory | `client` |
| Framework | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |

Set the frontend backend-origin variable before building:

```env
VITE_API_URL=https://product-brain-lite.onrender.com
```

Set the backend's allowed browser origin to:

```env
CLIENT_ORIGIN=https://product-brain-lite.vercel.app
```

Origins must match exactly: no trailing slash. Restart/redeploy the backend after changing its environment. Rebuild/redeploy the frontend after changing its build-time environment variables.

## Limitations

- Small, synthetic, English-language dataset; no claim of real-workspace performance.
- No independent held-out evaluation or completed external user study.
- Hit@3 accepts one expected source and does not establish multi-source completeness.
- Similarity gating can admit questions that the corpus does not answer.
- Citation checks validate identifiers, not claim-level entailment.
- Source panels show truncated previews, which may omit the supporting sentence.
- No authentication, uploads, per-user permissions, or real-workspace integrations.
- JSON-based retrieval is intentionally simple and has not been load-tested for scale.
- API rate limiting is not a global provider-spend cap; CORS is not authentication.
- Hosted-model availability, latency, and quotas affect the demo.

## Next steps

- Collect feedback from external users without guiding their first session.
- Build an independent held-out question set.
- Review citation support at the individual-claim level.
- Allow inspection of full retrieved chunks rather than previews alone.
- Strengthen quota and abuse controls before expanding public usage.

## Author

Built by [Mayank Negi](https://github.com/Equinox1704).
