"use client";

import { useState } from "react";

const SAMPLE = `Acme Cloud — Product Handbook

Acme Cloud is a managed hosting platform for small teams. It offers three plans: Starter ($12/month), Team ($39/month), and Business ($99/month). The Starter plan includes 2 projects and 10 GB of storage. The Team plan includes 20 projects, 100 GB of storage, and priority email support. The Business plan adds unlimited projects, 1 TB of storage, a 99.9% uptime SLA, and a dedicated account manager.

Support is available Monday to Friday, 9am to 6pm Pacific Time. Business plan customers also get 24/7 emergency phone support. Typical first-response time for email tickets is under 4 hours on Team and Business plans, and under 24 hours on Starter.

Acme Cloud offers a 30-day money-back guarantee on all annual plans. Monthly plans can be cancelled anytime and are not refundable for the current month. To request a refund, email billing@acme.example within 30 days of an annual purchase.

Data is stored in three regions: US-East, EU-West, and Asia-Pacific. Customers choose their region at signup. All data is encrypted at rest and in transit. Acme Cloud is SOC 2 Type II certified and performs daily backups retained for 30 days.

The platform integrates with GitHub, GitLab, and Bitbucket for automatic deployments. A command-line tool, acme, manages projects from the terminal.`;

type Indexed = { chunks: string[]; embeddings: number[][] };
type Answer = { answer: string; citations: { index: number; text: string }[] };

export default function App() {
  const [text, setText] = useState(SAMPLE);
  const [indexed, setIndexed] = useState<Indexed | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [busy, setBusy] = useState<"" | "indexing" | "asking">("");
  const [msg, setMsg] = useState<string | null>(null);

  async function indexDoc() {
    setBusy("indexing");
    setMsg(null);
    setAnswer(null);
    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.chunks) {
        setIndexed({ chunks: data.chunks, embeddings: data.embeddings });
        setMsg(`Indexed ${data.chunks.length} chunk(s) — ask away.`);
      } else {
        setMsg(data.error ?? "Indexing failed.");
      }
    } catch {
      setMsg("Indexing failed.");
    }
    setBusy("");
  }

  async function ask() {
    if (!indexed) {
      setMsg("Index the document first.");
      return;
    }
    if (!question.trim()) return;
    setBusy("asking");
    setMsg(null);
    setAnswer(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, chunks: indexed.chunks, embeddings: indexed.embeddings }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.answer) setAnswer(data);
      else setMsg(data.error ?? "Ask failed.");
    } catch {
      setMsg("Ask failed.");
    }
    setBusy("");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Ask the Docs</h1>
        <p className="mt-1 text-sm text-slate-500">
          Retrieval-augmented Q&amp;A — paste a document, index it, then ask questions and get answers grounded in the
          text, with citations.
        </p>
      </header>

      <section className="mt-8">
        <label className="text-xs font-medium uppercase tracking-wide text-slate-500">1 · Document</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          className="mt-2 w-full rounded-xl border border-slate-300 p-3 font-mono text-xs leading-relaxed text-slate-700 outline-none focus:border-slate-900"
        />
        <button
          onClick={indexDoc}
          disabled={busy !== ""}
          className="mt-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-50"
        >
          {busy === "indexing" ? "Indexing…" : indexed ? "Re-index" : "Index document"}
        </button>
      </section>

      <section className="mt-8">
        <label className="text-xs font-medium uppercase tracking-wide text-slate-500">2 · Ask</label>
        <div className="mt-2 flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") ask();
            }}
            placeholder="e.g. What are the support hours?"
            disabled={!indexed}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 disabled:bg-slate-50"
          />
          <button
            onClick={ask}
            disabled={busy !== "" || !indexed}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-50"
          >
            {busy === "asking" ? "Thinking…" : "Ask"}
          </button>
        </div>
        {!indexed && <p className="mt-1.5 text-xs text-slate-400">Index the document first to enable questions.</p>}
      </section>

      {msg && <div className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{msg}</div>}

      {answer && (
        <section className="mt-6 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Answer</p>
            <p className="mt-2 whitespace-pre-wrap text-slate-800">{answer.answer}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Sources ({answer.citations.length})
            </p>
            <ol className="mt-2 space-y-2">
              {answer.citations.map((c, i) => (
                <li key={c.index} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                  <span className="font-mono text-slate-400">[{i + 1}]</span> {c.text}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}
    </div>
  );
}
