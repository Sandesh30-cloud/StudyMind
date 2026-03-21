import { NextRequest, NextResponse } from "next/server";

const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const MAX_RETRIES = 2;

function buildSystemPrompt(subject: string, difficulty: string): string {
  return `You are StudyMind, an expert AI study assistant and patient teacher. Your sole purpose is to help students learn effectively.

## Your Teaching Philosophy
- Always structure responses with clear headings and organized sections
- Break complex topics into digestible steps
- Use examples, analogies, and real-world connections
- Never be vague — be specific, precise, and educational
- Adapt your explanation depth to the student's level

## Current Context
- Subject Focus: ${subject}
- Student Level: ${difficulty}

## Response Format Rules
- Use ## headings to organize long answers
- Use **bold** for key terms and important concepts
- Use bullet points and numbered lists for steps/features
- For algorithms/code, always explain BEFORE and AFTER the code
- For math, show each step clearly with explanations
- End complex explanations with a "💡 Key Takeaway" summary
- Use tables when comparing multiple items

## Explanation Levels
- Beginner: Use simple language, avoid jargon, use many analogies
- Intermediate: Use proper terminology, assume basic knowledge
- Advanced: Use technical depth, discuss trade-offs, edge cases, optimizations

## What You Do Best
1. **Explain concepts**: Clear, structured explanations with real examples
2. **Step-by-step solutions**: Walk through problems methodically with reasoning
3. **Summaries**: Bullet-point key ideas, highlight what's most important
4. **Code help**: Well-commented code with time/space complexity analysis
5. **Comparisons**: Structured tables or pros/cons lists
6. **Quiz prep**: Likely exam questions with detailed model answers

Always be encouraging, patient, and thorough. If a student is struggling, try a different analogy or approach.`;
}

function toGeminiContents(
  messages: Array<{ role: string; content: string }>
): Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> {
  return messages
    .filter(
      (message) =>
        typeof message.content === "string" &&
        message.content.trim().length > 0 &&
        (message.role === "user" || message.role === "assistant")
    )
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));
}

function extractGeminiText(data: {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
}): string {
  return (
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim() || ""
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRetryDelayMs(retryAfter: string | null, attempt: number): number {
  const seconds = Number(retryAfter);
  if (!Number.isNaN(seconds) && seconds > 0) {
    return seconds * 1000;
  }

  return 750 * (attempt + 1);
}

async function callGeminiApi(params: {
  apiKey: string;
  systemPrompt: string;
  messages: Array<{ role: string; content: string }>;
}) {
  const { apiKey, systemPrompt, messages } = params;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: toGeminiContents(messages),
          generationConfig: {
            maxOutputTokens: 2048,
            temperature: 0.7,
          },
        }),
      }
    );

    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      return { response, data };
    }

    if (response.status === 429 && attempt < MAX_RETRIES) {
      await sleep(getRetryDelayMs(response.headers.get("retry-after"), attempt));
      continue;
    }

    return { response, data };
  }

  throw new Error("Gemini request retry loop exited unexpectedly");
}

export async function POST(req: NextRequest) {
  try {
    const { messages, subject, difficulty } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request: messages array required" },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY" },
        { status: 500 }
      );
    }

    const systemPrompt = buildSystemPrompt(
      subject || "General",
      difficulty || "Intermediate"
    );

    // Keep last 30 messages for context
    const recentMessages = messages.slice(-30);

    const { response, data } = await callGeminiApi({
      apiKey,
      systemPrompt,
      messages: recentMessages,
    });

    if (!response.ok) {
      const message =
        response.status === 429
          ? "Gemini rate limit or quota reached. Wait a minute and try again, or switch to a different Gemini key/model."
          : response.status === 404
            ? "Gemini model not found. Set GEMINI_MODEL in .env to a valid model (e.g. gemini-2.0-flash)."
            : data?.error?.message || `Gemini API error (${response.status})`;

      return NextResponse.json(
        { error: message },
        { status: response.status === 404 ? 502 : response.status }
      );
    }

    const reply = extractGeminiText(data);

    if (!reply) {
      throw new Error("Empty response from Gemini");
    }

    return NextResponse.json({
      reply,
      usage: data.usageMetadata ?? null,
    });
  } catch (error: unknown) {
    console.error("Chat API error:", error);

    if (error instanceof TypeError) {
      return NextResponse.json(
        {
          error:
            "Could not reach the Gemini API. Check your internet connection, API key, and whether the Gemini endpoint is accessible from this machine.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
