import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ask the Docs — RAG Q&A",
  description:
    "Retrieval-augmented Q&A: paste a document, ask questions, get answers grounded in the text with citations.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
