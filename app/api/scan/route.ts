import { NextResponse } from "next/server";
import { load } from "cheerio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeUrl(input: string) {
  const normalized =
    input.startsWith("http://") || input.startsWith("https://")
      ? input
      : `https://${input}`;
  return new URL(normalized).toString();
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

async function timedFetch(url: string) {
  const start = Date.now();

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120",
    },
    redirect: "follow",
    cache: "no-store",
  });

  const duration = Date.now() - start;

  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

  const html = await res.text();
  const sizeKB = Buffer.byteLength(html, "utf8") / 1024;

  return { html, duration, sizeKB };
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const root = normalizeUrl(url);

    const { html, duration, sizeKB } = await timedFetch(root);
    const $ = load(html);

    const title = $("title").text().trim();
    const metaDesc = $('meta[name="description"]').attr("content") || "";
    const h1Count = $("h1").length;
    const h2Count = $("h2").length;
    const wordCount = $("body").text().split(/\s+/).length;
    const schemaCount = $('script[type="application/ld+json"]').length;

    const canonical = $('link[rel="canonical"]').length > 0;
    const noindex =
      $('meta[name="robots"]').attr("content")?.includes("noindex") || false;

    const robotsRes = await fetch(new URL("/robots.txt", root));
    const hasRobots = robotsRes.ok;

    const sitemapRes = await fetch(new URL("/sitemap.xml", root));
    const hasSitemap = sitemapRes.ok;

    const internalLinks = $('a[href^="/"]').length;

    // ---------- REAL TECHNICAL SCORE ----------
    const technicalScore = clamp(
      (duration < 800 ? 25 : duration < 1500 ? 15 : 5) +
        (sizeKB < 300 ? 20 : sizeKB < 800 ? 10 : 5) +
        (hasRobots ? 10 : 0) +
        (hasSitemap ? 10 : 0) +
        (canonical ? 10 : 0) -
        (noindex ? 40 : 0)
    );

    // ---------- CONTENT SCORE ----------
    const contentScore = clamp(
      (title.length > 30 ? 15 : 5) +
        (metaDesc.length > 70 ? 15 : 5) +
        (h1Count === 1 ? 15 : 5) +
        (h2Count >= 2 ? 10 : 5) +
        (wordCount > 900 ? 25 : wordCount > 600 ? 15 : 5)
    );

    // ---------- STRUCTURE SCORE ----------
    const structureScore = clamp(
      (schemaCount > 0 ? 30 : 5) +
        (internalLinks > 10 ? 20 : internalLinks > 5 ? 10 : 5) +
        (h2Count >= 3 ? 15 : 5)
    );

    const authority = clamp(
      technicalScore * 0.35 +
        contentScore * 0.35 +
        structureScore * 0.3
    );

    const aio = clamp(authority + (schemaCount > 0 ? 5 : -5));
    const geo = clamp(authority + (internalLinks > 10 ? 5 : -5));
    const aeo = clamp(authority + (h2Count >= 3 ? 5 : -5));

    const recommendations: string[] = [];

    if (duration > 1500)
      recommendations.push("Improve server response time and hosting performance.");

    if (sizeKB > 800)
      recommendations.push("Reduce page weight (compress images, remove unused scripts).");

    if (!hasRobots)
      recommendations.push("Add a robots.txt file.");

    if (!hasSitemap)
      recommendations.push("Add and submit sitemap.xml.");

    if (!canonical)
      recommendations.push("Add canonical tags to prevent duplicate indexing.");

    if (noindex)
      recommendations.push("Remove noindex tag if page should rank.");

    if (schemaCount === 0)
      recommendations.push("Add JSON-LD structured data (Organization, Article, FAQ).");

    if (wordCount < 900)
      recommendations.push("Increase topical depth to 900+ words.");

    if (internalLinks < 8)
      recommendations.push("Strengthen internal linking structure.");

    return NextResponse.json({
      scores: { authority, aio, geo, aeo },
      categories: {
        technical: technicalScore,
        content: contentScore,
        structure: structureScore,
      },
      recommendations,
      diagnostics: {
        responseTimeMs: duration,
        pageSizeKB: Math.round(sizeKB),
        wordCount,
        internalLinks,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Scan failed" },
      { status: 200 }
    );
  }
}