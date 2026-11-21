# Product Brain Lite

A source-cited knowledge assistant for a fictional product team.
Built with React, TypeScript, Node.js and local text embeddings.

Personal project. The corpus is synthetic; this app does not connect
to real Jira, Confluence or Slack workspaces.

## Features

- Search across product documents, tickets and chat threads.
- Generate answers with clickable inline source citations.
- Filter retrieval by source type.
- Reject low-similarity questions before calling the language model.
- Retry generation when no recognized citations are returned.
- Validate citation references against retrieved chunks.
- Run retrieval-only and full-pipeline evaluations.

Citation validation checks source identifiers, not whether every
claim is supported by its citation.

## Architecture

```text
Markdown corpus
    |
    v
Parse metadata -> Chunk text -> Local embeddings -> JSON vector index

React frontend
    |
    v
Express API -> Embed question -> Similarity search -> Top 5 chunks
                                                    |
                                                    v
                                              Language model
                                                    |
                                                    v
                                      Citation checks -> Answer
```

## Stack

- Frontend: React, TypeScript, Vite, TanStack Query
- Backend: Node.js, Express, Zod
- Embeddings: @xenova/transformers, all-MiniLM-L6-v2
- Retrieval: in-memory dot-product search over normalized vectors
- Generation: hosted language model through an OpenAI-compatible API
- Storage: local JSON vector index

## Dataset

45 synthetic Markdown files representing:

- 15 product documents
- 15 tickets
- 15 chat threads

The corpus includes dated decisions, policy updates, similar topics,
and distinctions between planned, approved and released work.

## Local setup

Install dependencies:

```bash
cd client
npm install
cd ../server
npm install
```

Create `server/.env`:

```env
LLM_API_KEY=your_key
LLM_BASE_URL=[https://api.groq.com/openai/v1](https://api.groq.com/openai/v1)
LLM_MODEL=qwen/qwen3.8-27b
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
```

Model availability and quotas depend on the provider account.
Never commit `.env` or expose the API key through frontend variables.

Build the index and start the API from `server`:

```bash
npm run ingest
npm run dev
```

In a second terminal, start the frontend from `client`:

```bash
npm run dev
```

Open the frontend URL printed by Vite.

## Evaluation

The development set contains 23 questions:

- 18 labelled answerable questions
- 5 questions initially labelled unanswerable

Document Hit@3 counts a question as successful when at least one
expected document appears among the three highest-ranked chunks.
It does not measure complete evidence coverage or answer accuracy.

Reviewed baseline:

- Document Hit@3: 17/18 (94.4%)
- Threshold false refusals: 0/18
- Threshold rejection of questions labelled unanswerable: 1/5

A full-pipeline run using the same baseline configuration recorded:

- Non-refusal responses on answerable questions: 18/18
- Automated refusal flags on questions labelled unanswerable: 4/5

Manual review found that the fifth response correctly stated that no
release date was committed. The corpus explicitly documents this,
so it is not equivalent to a question about entirely absent information.

### Experiments

| Configuration | Document Hit@3 | Threshold false refusals | Threshold rejections |
|---|---|---|---|
| 180 words, text only | 17/18 | 0/18 | 1/5 |
| 180 words, title prepended | 17/18 | 0/18 | 1/5 |
| 120 words, text only | 17/18 | 0/18 | 1/5 |

Neither tested change improved these metrics.

An initial 18/18 result used an overly broad expected-source label.
Source review corrected that label. A later review identified an
additional valid rationale source; the final baseline remained 17/18.

These questions were used during development and are not an
independent held-out test set.

Run retrieval evaluation from `server`:

```bash
npm run eval -- --label=my-run
```

Run full-pipeline evaluation:

```bash
npm run eval -- --full --label=my-full-run
```

Full evaluation uses the hosted model and is subject to API quotas.

## Findings

- Topic similarity does not establish whether a passage contains
  the specific fact requested.
- Top-three retrieval evaluation and top-five answer generation
  can produce different outcomes.
- Valid citation identifiers do not guarantee claim-level support.
- Phrase-based refusal detection can misclassify useful answers
  explaining that a value has not been committed.
- Source-label review is necessary before interpreting metric changes.

## Limitations

- Small, synthetic, English-language corpus.
- No independent held-out evaluation yet.
- Some questions require multiple sources, while Hit@3 accepts
  any one expected document.
- No authentication or per-user document permissions.
- No real external-service connectors.
- In-memory retrieval with a local JSON index.
- Source cards show truncated chunk previews, not necessarily the
  supporting sentence.
- Citation checks do not verify factual entailment.
- Public access requires additional quota and abuse controls.

## User feedback

External user testing has not yet been completed.

## Next steps

- Deploy a public demonstration using only the synthetic corpus.
- Collect and document user feedback.
- Add a held-out evaluation set and claim-level citation review.
- Improve source inspection so users can read full supporting chunks.
- Explore personal document uploads after adding appropriate
  authentication, isolation and deletion controls.