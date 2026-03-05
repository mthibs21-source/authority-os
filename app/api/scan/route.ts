import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

type Tier = "Critical" | "Needs Work" | "Strong";

type PageResult = {
  url: string;
  title?: string;
  wordCount: number;
  headings: number;
  hasSchema: boolean;
  schemaTypes: string[];
  entities: string[];
  internalLinks: number;
  externalLinks: number;
  issues: string[];
  recommendations: string[];
  score: number;
};

type Scores = {
  authority: number;
  aio: number;
  geo: number;
  aeo: number;
  citation: number;
};

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function normalize(url: string) {
  const u = (url || "").trim();
  if (!u) return "";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return `https://${u}`;
}

function stripHashAndQuery(u: string) {
  try {
    const url = new URL(u);
    url.hash = "";
    url.search = "";
    return url.toString();
  } catch {
    return u;
  }
}

function isSameHost(a: string, b: string) {
  try {
    return new URL(a).host === new URL(b).host;
  } catch {
    return false;
  }
}

function depthToLimit(depth: unknown): number {
  const d = typeof depth === "string" ? depth : "Standard";
  if (d === "Light") return 6;
  if (d === "Deep") return 25;
  return 12;
}

function guessTier(score: number): Tier {
  if (score >= 75) return "Strong";
  if (score >= 45) return "Needs Work";
  return "Critical";
}

function extractEntitiesFromText(text: string): string[] {
  // Basic, real extraction: look for repeated Title Cased phrases (brand-ish),
  // plus common business identifiers in footer-ish text.
  const cleaned = text
    .replace(/\s+/g, " ")
    .replace(/[^\w\s&.\-']/g, " ")
    .trim();

  const candidates = new Map<string, number>();

  // Pull title case sequences
  const re = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(cleaned)) !== null) {
    const phrase = m[1].trim();
    if (phrase.length < 3) continue;
    if (phrase.split(" ").length === 1 && phrase.length < 5) continue;
    candidates.set(phrase, (candidates.get(phrase) || 0) + 1);
  }

  // Add simple signals (Inc, LLC, Co)
  const bizRe = /\b([A-Z][\w&.\-']+(?:\s+[A-Z][\w&.\-']+){0,4})\s+(LLC|Inc|Co|Company|Ltd)\b/g;
  while ((m = bizRe.exec(cleaned)) !== null) {
    const phrase = `${m[1].trim()} ${m[2]}`.trim();
    candidates.set(phrase, (candidates.get(phrase) || 0) + 3);
  }

  // Return top 10
  return [...candidates.entries()]
    .sort((a, b) => b[1] - a[1])
    .map((x) => x[0])
    .slice(0, 10);
}

function detectSchemaTypes(html: string): string[] {
  const $ = cheerio.load(html);
  const types = new Set<string>();

  // JSON-LD
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).text() || "";
    try {
      const parsed = JSON.parse(raw);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const it of items) {
        if (!it) continue;
        const t = it["@type"];
        if (typeof t === "string") types.add(t);
        if (Array.isArray(t)) t.forEach((v) => typeof v === "string" && types.add(v));
        // @graph
        if (Array.isArray(it["@graph"])) {
          for (const g of it["@graph"]) {
            const gt = g?.["@type"];
            if (typeof gt === "string") types.add(gt);
            if (Array.isArray(gt)) gt.forEach((v) => typeof v === "string" && types.add(v));
          }
        }
      }
    } catch {
      // ignore JSON parse errors
    }
  });

  // Microdata / RDFa-ish hints
  $("[itemscope]").each((_, el) => {
    const itemtype = $(el).attr("itemtype");
    if (!itemtype) return;
    const parts = itemtype.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    if (last) types.add(last);
  });

  return [...types].slice(0, 20);
}

function countHeadings(html: string) {
  const h1 = (html.match(/<h1\b/gi) || []).length;
  const h2 = (html.match(/<h2\b/gi) || []).length;
  const h3 = (html.match(/<h3\b/gi) || []).length;
  return h1 + h2 + h3;
}

function scorePageSignals(params: {
  wordCount: number;
  headings: number;
  hasSchema: boolean;
  internalLinks: number;
  entitiesCount: number;
  hasFaqLike: boolean;
}) {
  const { wordCount, headings, hasSchema, internalLinks, entitiesCount, hasFaqLike } = params;

  // Page score 0-100 based on real signals we can measure
  let score = 0;

  // Content depth
  score += clamp(Math.round(wordCount / 40), 0, 35);

  // Headings structure
  score += clamp(headings * 4, 0, 20);

  // Schema
  score += hasSchema ? 18 : 0;

  // Internal links
  score += clamp(internalLinks * 2, 0, 15);

  // Entities
  score += clamp(entitiesCount * 2, 0, 10);

  // FAQ like pattern (Q/A)
  score += hasFaqLike ? 8 : 0;

  return clamp(score, 0, 100);
}

function buildIssuesAndRecs(p: {
  wordCount: number;
  headings: number;
  hasSchema: boolean;
  schemaTypes: string[];
  internalLinks: number;
  entitiesCount: number;
  hasFaqLike: boolean;
}) {
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (p.wordCount < 400) {
    issues.push("Thin content (low word count), page may not fully answer intent.");
    recommendations.push("Expand this page to fully answer intent (aim for 800+ words where it matters).");
  }

  if (p.headings < 3) {
    issues.push("Weak heading structure (few headings), content is harder to scan and extract.");
    recommendations.push("Add clear H2 sections and concise subheadings aligned to intent.");
  }

  if (!p.hasSchema) {
    issues.push("No JSON-LD schema detected, AI and search have less context.");
    recommendations.push("Add JSON-LD schema (Organization, Website, Breadcrumb, FAQ, Service).");
  } else if (p.schemaTypes.length === 0) {
    issues.push("Schema is present but types could not be detected (possible malformed JSON-LD).");
    recommendations.push("Validate JSON-LD and ensure @type is present (Organization, LocalBusiness, FAQPage, etc).");
  }

  if (p.internalLinks < 3) {
    issues.push("Weak internal linking, reduces crawl and topical authority flow.");
    recommendations.push("Add 6 to 10 contextual internal links to related services, locations, and guides.");
  }

  if (p.entitiesCount < 3) {
    issues.push("Weak entity signals, brand identity may not be explicit enough.");
    recommendations.push("Add consistent business name, about section, NAP, and Organization schema across key pages.");
  }

  if (!p.hasFaqLike) {
    issues.push("Few extractable Q and A patterns, reduces answer engine signals.");
    recommendations.push("Add a FAQ block with 5 to 8 questions and concise answers, then add FAQ schema.");
  }

  // Deduplicate
  return {
    issues: [...new Set(issues)].slice(0, 6),
    recommendations: [...new Set(recommendations)].slice(0, 6),
  };
}

async function fetchHtml(url: string) {
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; AuthorityOSBot/1.0; +https://example.com/bot)",
      "Accept":
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    // Vercel serverless sometimes benefits from no cache
    cache: "no-store",
  });

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    // Still allow, but may be useless
  }

  const html = await res.text();
  return html;
}

function extractLinks(html: string, baseUrl: string) {
  const $ = cheerio.load(html);
  const links: string[] = [];

  $("a").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    // ignore mailto, tel, anchors
    if (href.startsWith("#")) return;
    if (href.startsWith("mailto:")) return;
    if (href.startsWith("tel:")) return;
    if (href.startsWith("javascript:")) return;

    try {
      const absolute = href.startsWith("http")
        ? href
        : new URL(href, baseUrl).toString();
      links.push(stripHashAndQuery(absolute));
    } catch {
      // ignore
    }
  });

  return [...new Set(links)];
}

async function crawlSite(startUrl: string, limitPages: number) {
  const visited = new Set<string>();
  const queue: string[] = [stripHashAndQuery(startUrl)];
  const pages: PageResult[] = [];

  const origin = new URL(startUrl).origin;

  while (queue.length > 0 && pages.length < limitPages) {
    const current = queue.shift();
    if (!current) continue;
    if (visited.has(current)) continue;

    visited.add(current);

    // Only crawl same host
    if (!isSameHost(current, startUrl)) continue;

    try {
      const html = await fetchHtml(current);
      const $ = cheerio.load(html);

      const title =
        $("title").first().text().trim() ||
        $("h1").first().text().trim() ||
        undefined;

      const bodyText = $("body").text().replace(/\s+/g, " ").trim();
      const wordCount = bodyText ? bodyText.split(" ").length : 0;

      const headings = countHeadings(html);

      const schemaTypes = detectSchemaTypes(html);
      const hasSchema = html.includes("application/ld+json") || schemaTypes.length > 0;

      const allLinks = extractLinks(html, current);
      const internal = allLinks.filter((l) => l.startsWith(origin));
      const external = allLinks.filter((l) => !l.startsWith(origin));

      const entities = extractEntitiesFromText(bodyText);
      const entitiesCount = entities.length;

      const hasFaqLike =
        /faq/i.test(bodyText) ||
        /\bq:\b/i.test(bodyText) ||
        /\ba:\b/i.test(bodyText) ||
        /questions/i.test(bodyText);

      const score = scorePageSignals({
        wordCount,
        headings,
        hasSchema,
        internalLinks: internal.length,
        entitiesCount,
        hasFaqLike,
      });

      const { issues, recommendations } = buildIssuesAndRecs({
        wordCount,
        headings,
        hasSchema,
        schemaTypes,
        internalLinks: internal.length,
        entitiesCount,
        hasFaqLike,
      });

      pages.push({
        url: current,
        title,
        wordCount,
        headings,
        hasSchema,
        schemaTypes,
        entities,
        internalLinks: internal.length,
        externalLinks: external.length,
        issues,
        recommendations,
        score,
      });

      // enqueue more internal links (cap queue growth)
      for (const link of internal.slice(0, 40)) {
        if (!visited.has(link) && !queue.includes(link)) queue.push(link);
      }
    } catch {
      // ignore page errors and keep going
    }
  }

  return pages;
}

function summarizeSite(pages: PageResult[]) {
  const pagesScanned = pages.length || 1;

  const avgScore = pages.reduce((a, b) => a + b.score, 0) / pagesScanned;

  // Derive global scores from real crawl
  const authority = clamp(Math.round(avgScore));
  const aio = clamp(Math.round(avgScore * 0.72));
  const geo = clamp(Math.round(avgScore * 0.66));
  const aeo = clamp(Math.round(avgScore * 0.58));
  const citation = clamp(Math.round(avgScore * 0.62));

  const scores: Scores = { authority, aio, geo, aeo, citation };

  // Global entities and schema types
  const entityCounts = new Map<string, number>();
  const schemaCounts = new Map<string, number>();

  for (const p of pages) {
    for (const e of p.entities) entityCounts.set(e, (entityCounts.get(e) || 0) + 1);
    for (const s of p.schemaTypes) schemaCounts.set(s, (schemaCounts.get(s) || 0) + 1);
  }

  const entities = [...entityCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map((x) => x[0])
    .slice(0, 12);

  const schemaTypes = [...schemaCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map((x) => x[0])
    .slice(0, 12);

  // Reasons per metric (your UI consumes these)
  const reasons: Partial<Record<keyof Scores, string[]>> = {};

  const thinPages = pages.filter((p) => p.wordCount < 400).length;
  const missingSchemaPages = pages.filter((p) => !p.hasSchema).length;
  const weakInternal = pages.filter((p) => p.internalLinks < 3).length;
  const weakEntities = pages.filter((p) => p.entities.length < 3).length;
  const weakFaq = pages.filter((p) => p.recommendations.some((r) => r.toLowerCase().includes("faq"))).length;

  reasons.authority = [
    `${thinPages} pages look thin on content.`,
    `${missingSchemaPages} pages are missing schema.`,
    `${weakInternal} pages have weak internal linking.`,
  ].filter(Boolean);

  reasons.aio = [
    `${weakFaq} pages lack clear Q and A style structure.`,
    `${missingSchemaPages} pages missing JSON-LD reduces extraction confidence.`,
  ].filter(Boolean);

  reasons.geo = [
    `${weakEntities} pages have weak entity signals.`,
    `${weakInternal} pages need better internal linking to form topical clusters.`,
  ].filter(Boolean);

  reasons.aeo = [
    `${weakFaq} pages need FAQ blocks for answer extraction.`,
    `${missingSchemaPages} pages missing FAQ and breadcrumb schema.`,
  ].filter(Boolean);

  // Build recommendations (richer objects or strings, your UI normalizes either)
  const recs = new Map<string, { title: string; severity: Tier; why: string; how: string; impact: number }>();

  const addRec = (key: string, rec: { title: string; severity: Tier; why: string; how: string; impact: number }) => {
    if (!recs.has(key)) recs.set(key, rec);
  };

  if (missingSchemaPages > 0) {
    addRec("schema", {
      title: "Add JSON-LD schema to key pages",
      severity: "Critical",
      why: "Schema tells AI exactly what your business and pages represent, which increases trust and citation likelihood.",
      how: "Add Organization (or LocalBusiness), Website, Breadcrumb, and FAQPage schema. Validate JSON-LD.",
      impact: 9,
    });
  }

  if (thinPages > 0) {
    addRec("depth", {
      title: "Increase content depth on thin pages",
      severity: "Critical",
      why: "Thin pages fail intent, AI engines avoid citing pages that do not fully answer questions.",
      how: "Expand service pages with proof, process, FAQs, pricing ranges, and examples. Target 800+ words where it matters.",
      impact: 9,
    });
  }

  if (weakInternal > 0) {
    addRec("internal", {
      title: "Strengthen internal linking to form topic clusters",
      severity: "Needs Work",
      why: "Internal links create topic clusters and distribute authority across important pages.",
      how: "Add 6 to 10 contextual internal links per core page to related services, locations, and supporting guides.",
      impact: 7,
    });
  }

  if (weakEntities > 0) {
    addRec("entities", {
      title: "Improve entity clarity (brand signals)",
      severity: "Needs Work",
      why: "AI needs clear business identity to trust and recommend you.",
      how: "Add consistent business name, about page, contact NAP, and Organization schema. Use consistent terminology across pages.",
      impact: 7,
    });
  }

  addRec("faq", {
    title: "Add FAQ sections to core pages",
    severity: "Needs Work",
    why: "FAQ blocks create extractable answers, improving AEO and AI recommendation likelihood.",
    how: "Add 5 to 8 FAQs per core page, answer concisely, then add FAQPage schema.",
    impact: 7,
  });

  const recommendations = [...recs.values()].slice(0, 10);

  // Convert page results to UI-friendly shape
  const uiPages = pages.slice(0, 20).map((p) => ({
    url: p.url,
    title: p.title,
    scores: { authority: p.score },
    issues: p.issues,
    recommendations: p.recommendations,
  }));

  return { scores, recommendations, reasons, entities, schemaTypes, pages: uiPages, pagesScanned };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      url?: string;
      competitor?: string;
      depth?: string | number;
    };

    const url = normalize(body.url || "");
    if (!url) {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    const limit = depthToLimit(body.depth);
    const pages = await crawlSite(url, limit);

    const base = summarizeSite(pages);

    let competitorBlock: any = null;

    const competitorUrl = normalize(body.competitor || "");
    if (competitorUrl) {
      const compPages = await crawlSite(competitorUrl, Math.min(limit, 12));
      const compSummary = summarizeSite(compPages);

      competitorBlock = {
        url: competitorUrl,
        scores: compSummary.scores,
        entities: compSummary.entities,
        schemaTypes: compSummary.schemaTypes,
      };
    }

    return NextResponse.json({
      ...base,
      competitor: competitorBlock,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Scan failed" },
      { status: 500 }
    );
  }
}
