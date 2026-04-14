"use client";

import { useState, useRef } from "react";
import ReviewTypeSelector from "@/components/ReviewTypeSelector";
import ResultsPanel from "@/components/ResultsPanel";

type ReviewType = "all" | "bugs" | "performance" | "security";

export default function Home() {
  const [code, setCode] = useState("");
  const [reviewType, setReviewType] = useState<ReviewType>("all");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  async function handleReview() {
    if (!code.trim()) {
      setError("Please paste some code first.");
      return;
    }
    setError("");
    setResult("");
    setIsLoading(true);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, reviewType }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error("Something went wrong. Please try again.");
      if (!res.body) throw new Error("No response body.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setResult((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleStop() {
    abortRef.current?.abort();
    setIsLoading(false);
  }

  function handleClear() {
    setCode("");
    setResult("");
    setError("");
  }

  return (
    <main className="min-h-screen bg-[#111111] text-white">
      {/* Header */}
      <div className="border-b border-white/[0.07] px-6 sm:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#1e1e1e] rounded-lg flex items-center justify-center">
            <svg width="15" height="15" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
              <polyline points="44,28 22,60 44,92" fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="76,28 98,60 76,92" fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="68" y1="28" x2="52" y2="92" stroke="#C0460A" strokeWidth="10" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-sm font-medium tracking-tight">CodeReview<span className="text-[#C0460A]">AI</span></span>
        </div>
        <span className="text-xs text-[#555] hidden sm:block">Powered by Claude</span>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-10 sm:py-16 flex flex-col gap-10">

        {/* Hero text */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
            AI code review,<br />
            <span className="text-[#C0460A]">instantly.</span>
          </h1>
          <p className="text-[#666] text-base max-w-md leading-relaxed">
            Paste any code snippet and get structured feedback on bugs, performance, and security — streamed in real time.
          </p>
        </div>

        {/* Input area */}
        <div className="flex flex-col gap-4">
          <label className="text-xs font-medium text-[#555] uppercase tracking-widest">
            Your code
          </label>
          <div className="relative">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={`// Paste your code here...\nfunction example() {\n  return null\n}`}
              spellCheck={false}
              className="w-full h-64 sm:h-80 bg-[#161616] border border-white/10 rounded-xl px-5 py-4 text-sm text-[#ddd] font-mono placeholder:text-[#333] resize-none focus:outline-none focus:border-white/20 transition-colors leading-relaxed"
            />
            {code && (
              <button
                onClick={handleClear}
                className="absolute top-3 right-3 text-xs text-[#555] hover:text-[#aaa] transition-colors px-2 py-1 rounded"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Review type */}
        <div className="flex flex-col gap-4">
          <label className="text-xs font-medium text-[#555] uppercase tracking-widest">
            Review focus
          </label>
          <ReviewTypeSelector selected={reviewType} onChange={setReviewType} />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleReview}
            disabled={isLoading}
            className="text-sm font-medium text-white bg-[#C0460A] hover:bg-[#E8652A] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 px-6 py-3 rounded-lg transition-all duration-150"
          >
            {isLoading ? "Reviewing…" : "Review my code"}
          </button>
          {isLoading && (
            <button
              onClick={handleStop}
              className="text-sm text-[#aaa] border border-white/15 hover:border-white/30 hover:text-white px-5 py-3 rounded-lg transition-all duration-150"
            >
              Stop
            </button>
          )}
        </div>

        {/* Results */}
        <ResultsPanel result={result} isLoading={isLoading} />
      </div>
    </main>
  );
}