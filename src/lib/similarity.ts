/** Cosine similarity of two equal-length vectors. Returns 0 for invalid input. */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/** Indices of the `k` vectors most similar to `query`, highest similarity first. */
export function topK(query: number[], vectors: number[][], k: number): number[] {
  return vectors
    .map((vec, index) => ({ index, score: cosineSimilarity(query, vec) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(0, k))
    .map((entry) => entry.index);
}
