import { describe, it, expect } from "vitest";
import { chunkText } from "./chunk";

describe("chunkText", () => {
  it("returns nothing for empty/whitespace input", () => {
    expect(chunkText("")).toEqual([]);
    expect(chunkText("   \n  ")).toEqual([]);
  });

  it("returns a single chunk when the text fits", () => {
    expect(chunkText("one two three", { chunkSize: 120, overlap: 20 })).toEqual(["one two three"]);
  });

  it("splits long text into overlapping chunks", () => {
    const words = Array.from({ length: 300 }, (_, i) => `w${i}`).join(" ");
    const chunks = chunkText(words, { chunkSize: 120, overlap: 20 });

    expect(chunks.length).toBeGreaterThan(1);
    // consecutive chunks share `overlap` words
    const first = chunks[0].split(" ");
    const second = chunks[1].split(" ");
    expect(first.slice(-20)).toEqual(second.slice(0, 20));
    // the final word is included
    expect(chunks[chunks.length - 1]).toContain("w299");
  });
});
