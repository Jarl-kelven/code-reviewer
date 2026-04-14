import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";
import { z } from "zod";

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const schema = z.object({
  code: z.string().min(1, "Code is required").max(10000, "Code is too long"),
  reviewType: z.enum(["all", "bugs", "performance", "security"]),
});

const focusMap = {
  all: `Review the code thoroughly covering all of the following:
- **Bugs & Logic Errors**: identify any incorrect logic, edge cases, or runtime errors
- **Performance**: highlight inefficiencies, unnecessary re-renders, memory leaks, or slow operations
- **Security**: flag vulnerabilities like injection risks, exposed secrets, or unsafe operations
- **Code Quality**: note readability, naming, and structural improvements`,

  bugs: `Focus exclusively on **bugs and logic errors**:
- Incorrect logic or wrong assumptions
- Unhandled edge cases or null/undefined values
- Runtime errors or exceptions that could be thrown
- Off-by-one errors, infinite loops, or broken control flow`,

  performance: `Focus exclusively on **performance issues**:
- Unnecessary computations or re-renders
- Inefficient data structures or algorithms
- Memory leaks or expensive operations in hot paths
- Missing memoization, caching, or lazy loading opportunities`,

  security: `Focus exclusively on **security vulnerabilities**:
- Injection risks (SQL, XSS, command injection)
- Exposed secrets, tokens, or sensitive data
- Insecure authentication or authorization patterns
- Unsafe use of eval, dangerouslySetInnerHTML, or similar`,
};

function buildPrompt(code: string, reviewType: keyof typeof focusMap): string {
  return `You are an expert software engineer conducting a code review. Be direct, specific, and actionable.

${focusMap[reviewType]}

Format your response clearly using this structure:

## Summary
One or two sentences on the overall quality and main concerns.

## Issues Found
For each issue, use this format:

**[Severity: Critical | High | Medium | Low]** — Issue title

Explain what the problem is and why it matters. Then show the fix:

\`\`\`
// fixed code here
\`\`\`

---

## Recommendations
2–4 bullet points of general improvements that don't warrant a full issue entry.

If the code looks good with no issues, say so clearly and briefly explain why it's well written.

Here is the code to review:

\`\`\`
${code}
\`\`\``;
}

export async function POST(req: NextRequest) {
  console.log("KEY:", process.env.GEMINI_API_KEY?.slice(0, 10)); 
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.issues[0].message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { code, reviewType } = parsed.data;
    const prompt = buildPrompt(code, reviewType);

    const model = client.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const result = await model.generateContentStream(prompt);

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("Review API error:", err);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}