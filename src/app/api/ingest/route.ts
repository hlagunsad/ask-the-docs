import { NextResponse } from "next/server";
import { chunkText } from "@/lib/chunk";
import { embedTexts } from "@/lib/gemini";

// Splits a document into chunks and embeds them. Returns the chunks + their
// vectors to the client, which holds them between Index and Ask (stateless server).
export async function POST(req: Request) {
  try {
    const { text } = (await req.json()) as { text?: string };
    if (!text || !text.trim()) {
      return NextResponse.json({ error: "No text to index." }, { status: 400 });
    }

    const chunks = chunkText(text);
    if (chunks.length === 0) {
      return NextResponse.json({ error: "Nothing to index." }, { status: 400 });
    }

    const embeddings = await embedTexts(chunks);
    return NextResponse.json({ chunks, embeddings });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Indexing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
