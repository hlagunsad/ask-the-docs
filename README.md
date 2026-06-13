# Ask the Docs

A retrieval-augmented generation (RAG) Q&A app: paste a document and ask questions that are answered **grounded in the text**, with **citations** to the exact chunks used. Real retrieval — not a thin LLM wrapper.

**Live demo:** _deploying to Vercel_

## How it works
1. **Index** — the document is split into overlapping chunks, each embedded with Gemini (`gemini-embedding-001`).
2. **Ask** — the question is embedded, the most similar chunks are retrieved (cosine similarity, top-k), and Gemini (`gemini-2.5-flash`) answers using only those chunks, citing them.

It's **stateless**: embeddings are computed and held client-side between Index and Ask, so there's no database — it deploys cleanly on serverless.

## Tech
Next.js (App Router + route handlers) · TypeScript · Google Gemini (embeddings + generation) · Tailwind · Vitest · Playwright.

## Run locally
```bash
npm install
# .env.local:
#   GEMINI_API_KEY=...   (free key from https://aistudio.google.com/app/apikey)
npm run dev        # http://localhost:3000
npm test           # Vitest unit tests (chunking + similarity)
npm run test:e2e   # Playwright (index sample doc → ask → cited answer)
```

## Tests
- **Unit (Vitest):** chunking (boundaries + overlap) and cosine similarity / top-k retrieval — the deterministic core of RAG.
- **E2E (Playwright):** indexes the sample document, asks a question, and confirms a grounded answer + sources render.
