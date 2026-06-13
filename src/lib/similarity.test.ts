import { describe, it, expect } from "vitest";
import { cosineSimilarity, topK } from "./similarity";

describe("cosineSimilarity", () => {
  it("is 1 for identical vectors", () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1);
  });
  it("is 0 for orthogonal vectors", () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
  });
  it("is -1 for opposite vectors", () => {
    expect(cosineSimilarity([1, 1], [-1, -1])).toBeCloseTo(-1);
  });
  it("returns 0 for mismatched or empty vectors", () => {
    expect(cosineSimilarity([1, 2], [1, 2, 3])).toBe(0);
    expect(cosineSimilarity([], [])).toBe(0);
  });
});

describe("topK", () => {
  it("returns the most similar vectors, best first", () => {
    const query = [1, 0, 0];
    const vectors = [
      [0, 1, 0], // orthogonal
      [1, 0, 0], // identical → best
      [0.9, 0.1, 0], // close → second
    ];
    expect(topK(query, vectors, 2)).toEqual([1, 2]);
  });
  it("respects k", () => {
    expect(topK([1, 0], [[1, 0], [0, 1], [1, 1]], 1)).toHaveLength(1);
  });
});
