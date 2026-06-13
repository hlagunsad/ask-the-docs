import { NextResponse } from "next/server";
import { embedText, generateAnswer } from "@/lib/gemini";
import { topK } from "@/lib/similarity";

const TOP_K = 3;

// Embeds the question, retrieves the most similar chunks, and asks Gemini to
// answer grounded in only those — returning the answer plus the cited chunks.
export async function POST(req: Request) {
  try {
    const { question, chunks, embeddings } = (await req.json()) as {
      question?: string;
      chunks?: string[];
      embeddings?: number[][];
    };

    if (!question || !question.trim()) {
      return NextResponse.json({ error: "No question." }, { status: 400 });
    }
    if (!chunks?.length || !embeddings?.length) {
      return NextResponse.json({ error: "Index a document first." }, { status: 400 });
    }

    const queryVector = await embedText(question);
    const indices = topK(queryVector, embeddings, Math.min(TOP_K, chunks.length));
    const contexts = indices.map((i) => chunks[i]);
    const answer = await generateAnswer(question, contexts);

    return NextResponse.json({
      answer,
      citations: indices.map((i) => ({ index: i, text: chunks[i] })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ask failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
