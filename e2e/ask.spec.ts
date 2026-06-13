import { test, expect } from "@playwright/test";

// Exercises the full RAG flow against the live Gemini API: index the preloaded
// sample doc, ask a question, and confirm a grounded answer + sources render.
test("index a document and get a cited answer", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Index document" }).click();
  await expect(page.getByText(/Indexed \d+ chunk/)).toBeVisible({ timeout: 30000 });

  await page.getByPlaceholder("e.g. What are the support hours?").fill("What are the support hours?");
  await page.getByRole("button", { name: "Ask" }).click();

  await expect(page.getByText("Answer", { exact: true })).toBeVisible({ timeout: 30000 });
  await expect(page.getByText(/Sources \(\d+\)/)).toBeVisible();
});
