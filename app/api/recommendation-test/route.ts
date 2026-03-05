import { NextResponse } from "next/server";

type Input = {
  businessName: string;
  service: string;
  city: string;
  website?: string;
  competitors?: string[];
};

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function buildPrompts(service: string, city: string) {
  const s = (service || "").trim();
  const c = (city || "").trim();

  // Keep it simple and repeatable
  return [
    `Best ${s} in ${c}`,
    `Top ${s} companies in ${c}`,
    `Who are trusted ${s} providers in ${c}`,
    `Most recommended ${s} in ${c}`,
  ];
}

async function callOpenAI(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

  // Uses Responses API (works well for structured JSON)
  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You are generating a short list of recommended businesses. Return ONLY valid JSON.",
        },
        {
          role: "user",
          content: `Prompt: ${prompt}

Return JSON with this shape:
{
  "prompt": "...",
  "results": [
    { "name": "Business A", "reason": "..." },
    { "name": "Business B", "reason": "..." },
    { "name": "Business C", "reason": "..." }
  ]
}

Rules:
- Always return exactly 3 results.
- Use plausible business names.
- Do not include markdown.`,
        },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenAI error: ${t}`);
  }

  const json = await res.json();
  const text = json?.output?.[0]?.content?.[0]?.text;
  if (!text) throw new Error("No model output");

  return JSON.parse(text);
}

function scoreVisibility(hitCount: number, total: number) {
  if (total <= 0) return 0;
  return clamp(Math.round((hitCount / total) * 100));
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Input;

    if (!body.businessName || !body.service || !body.city) {
      return NextResponse.json(
        { error: "Missing businessName, service, or city" },
        { status: 400 }
      );
    }

    const prompts = buildPrompts(body.service, body.city);

    const runs = [];
    for (const p of prompts) {
      runs.push(await callOpenAI(p));
    }

    const yourName = body.businessName.toLowerCase();
    const compNames = (body.competitors || []).map((c) => c.toLowerCase());

    let yourHits = 0;
    const competitorHits: Record<string, number> = {};
    compNames.forEach((c) => (competitorHits[c] = 0));

    const normalized = runs.map((r) => {
      const names = (r?.results || []).map((x: any) => String(x?.name || ""));
      const lower = names.map((n: string) => n.toLowerCase());

      const youMentioned = lower.some((n: string) => n.includes(yourName));
      if (youMentioned) yourHits += 1;

      for (const c of compNames) {
        const hit = lower.some((n: string) => n.includes(c));
        if (hit) competitorHits[c] += 1;
      }

      return {
        prompt: r.prompt || "",
        results: r.results || [],
        youMentioned,
      };
    });

    const visibilityScore = scoreVisibility(yourHits, prompts.length);

    return NextResponse.json({
      visibilityScore,
      yourHits,
      totalPrompts: prompts.length,
      prompts: normalized,
      competitorHits,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Recommendation test failed" },
      { status: 500 }
    );
  }
}