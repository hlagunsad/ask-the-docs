export interface ChunkOptions {
  /** Words per chunk. */
  chunkSize?: number;
  /** Words shared between consecutive chunks (context continuity). */
  overlap?: number;
}

/**
 * Split text into overlapping, word-based chunks. Overlap keeps context from
 * being cut mid-thought across chunk boundaries — important for retrieval quality.
 */
export function chunkText(text: string, opts: ChunkOptions = {}): string[] {
  const chunkSize = opts.chunkSize ?? 120;
  const overlap = opts.overlap ?? 20;

  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  if (words.length <= chunkSize) return [words.join(" ")];

  const step = Math.max(1, chunkSize - overlap);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += step) {
    chunks.push(words.slice(i, i + chunkSize).join(" "));
    if (i + chunkSize >= words.length) break;
  }
  return chunks;
}
