import { GoogleGenerativeAI } from "@google/generative-ai";

const EMBED_MODEL = "gemini-embedding-001";
const GEN_MODEL = "gemini-2.5-flash";

let client: GoogleGenerativeAI | undefined;

/** Lazy server-only Gemini client (never instantiated at import/build time). */
function genAI(): GoogleGenerativeAI {
  if (!client) client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  return client;
}

/** Embed a single string into a vector. */
export async function embedText(text: string): Promise<number[]> {
  const model = genAI().getGenerativeModel({ model: EMBED_MODEL });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

/** Embed many strings (used to index document chunks). */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  return Promise.all(texts.map((t) => embedText(t)));
}

/** Generate an answer grounded ONLY in the provided context chunks, with citations. */
export async function generateAnswer(question: string, contexts: string[]): Promise<string> {
  const model = genAI().getGenerativeModel({ model: GEN_MODEL });
  const numbered = contexts.map((c, i) => `[${i + 1}] ${c}`).join("\n\n");
  const prompt = [
    "You are a precise assistant. Answer the question using ONLY the context snippets below.",
    "If the answer is not in the context, say you don't know — do not invent anything.",
    "Cite the snippet numbers you used, like [1] or [2].",
    "",
    `Context:\n${numbered}`,
    "",
    `Question: ${question}`,
    "Answer:",
  ].join("\n");
  const result = await model.generateContent(prompt);
  return result.response.text();
}
