import { NextResponse } from "next/server"

function normalize(url: string) {
  if (!url) return ""
  if (!url.startsWith("http")) return "https://" + url
  return url
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)))
}

async function fetchHtml(url: string) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 AuthorityOS Scanner"
      }
    })
    return await res.text()
  } catch {
    return ""
  }
}

/* ------------------------------
   SIGNAL DETECTION
--------------------------------*/

function detectSignals(html: string) {

  const text = html.replace(/<[^>]*>/g, " ")
  const words = text.split(/\s+/).filter(Boolean)

  const signals = {
    hasFAQSchema: html.includes("FAQPage"),
    hasOpenGraph: html.includes("og:title"),
    hasAltTags: html.includes("alt="),
    hasLists: html.includes("<ul") || html.includes("<ol"),
    hasAnswerHeadings: html.includes("?") && html.includes("<h"),
    hasDefinitionBlocks: text.toLowerCase().includes(" is "),
    hasLLMSTxt: html.includes("llms.txt"),
    hasTopicClusters: html.includes("related") || html.includes("guide"),
    internalLinks: (html.match(/href="\//g) || []).length,
    wordCount: words.length
  }

  return signals
}

/* ------------------------------
   SCORE ENGINE
--------------------------------*/

function buildScores(signals: any) {

  let authority = 50
  let aio = 40
  let geo = 40
  let aeo = 30

  if (signals.hasOpenGraph) authority += 10
  if (signals.internalLinks > 8) authority += 10
  if (signals.wordCount > 800) authority += 10

  if (signals.hasLists) aio += 10
  if (signals.hasDefinitionBlocks) aio += 10

  if (signals.internalLinks > 10) geo += 10
  if (signals.hasTopicClusters) geo += 10

  if (signals.hasFAQSchema) aeo += 20
  if (signals.hasAnswerHeadings) aeo += 10

  return {
    authority: clamp(authority),
    aio: clamp(aio),
    geo: clamp(geo),
    aeo: clamp(aeo)
  }
}

/* ------------------------------
   REASONS
--------------------------------*/

function buildReasons(signals: any) {

  const reasons: any = {
    authority: [],
    aio: [],
    geo: [],
    aeo: []
  }

  if (!signals.hasOpenGraph)
    reasons.authority.push("Missing Open Graph metadata")

  if (signals.internalLinks < 8)
    reasons.authority.push("Weak internal linking structure")

  if (!signals.hasLists)
    reasons.aio.push("Content lacks structured lists")

  if (!signals.hasDefinitionBlocks)
    reasons.aio.push("Important terms lack clear definitions")

  if (signals.internalLinks < 10)
    reasons.geo.push("Weak topical cluster linking")

  if (!signals.hasTopicClusters)
    reasons.geo.push("Content does not form topical clusters")

  if (!signals.hasFAQSchema)
    reasons.aeo.push("Missing FAQ schema markup")

  if (!signals.hasAnswerHeadings)
    reasons.aeo.push("Pages lack question-based headings")

  return reasons
}

/* ------------------------------
   DETAILED RECOMMENDATIONS
--------------------------------*/

function buildDetailedRecommendations(signals: any) {

  const recs: any[] = []

  if (!signals.hasFAQSchema) {
    recs.push({
      category: "AEO",
      title: "Add FAQ Schema",
      why: "AI engines extract direct answers from structured FAQ blocks.",
      how: [
        "Create a FAQ section with 3-5 questions",
        "Add JSON-LD FAQPage schema",
        "Place the schema in the page head or footer"
      ],
      impact: "+12 AEO score"
    })
  }

  if (!signals.hasAnswerHeadings) {
    recs.push({
      category: "AEO",
      title: "Use Question Headings",
      why: "AI answer engines prioritize content formatted as questions and answers.",
      how: [
        "Add headings like 'What is...' or 'How does...'",
        "Follow each heading with a short answer paragraph"
      ],
      impact: "+8 AEO score"
    })
  }

  if (!signals.hasLists) {
    recs.push({
      category: "AIO",
      title: "Add Structured Lists",
      why: "AI systems extract information easier from bullet lists.",
      how: [
        "Convert sections into bullet lists",
        "Use numbered steps for processes"
      ],
      impact: "+10 AIO score"
    })
  }

  if (!signals.hasDefinitionBlocks) {
    recs.push({
      category: "AIO",
      title: "Add Definition Sentences",
      why: "AI models prefer clear concept definitions.",
      how: [
        "Define key terms clearly",
        "Example: 'AuthorityOS is an AI search authority scanner.'"
      ],
      impact: "+7 AIO score"
    })
  }

  if (signals.internalLinks < 8) {
    recs.push({
      category: "GEO",
      title: "Improve Internal Linking",
      why: "Search engines build topical authority through internal links.",
      how: [
        "Link related pages together",
        "Add contextual anchor text"
      ],
      impact: "+10 GEO score"
    })
  }

  if (!signals.hasTopicClusters) {
    recs.push({
      category: "GEO",
      title: "Create Topic Clusters",
      why: "Topical clusters increase entity authority.",
      how: [
        "Create pillar pages",
        "Add supporting topic articles"
      ],
      impact: "+12 GEO score"
    })
  }

  if (!signals.hasAltTags) {
    recs.push({
      category: "SEO",
      title: "Add Image Alt Tags",
      why: "Alt attributes help search engines understand images.",
      how: [
        "Add descriptive alt attributes",
        "Include relevant keywords naturally"
      ],
      impact: "+5 SEO score"
    })
  }

  if (signals.wordCount < 600) {
    recs.push({
      category: "SEO",
      title: "Increase Content Depth",
      why: "Pages with deeper content rank higher.",
      how: [
        "Expand page to 800-1500 words",
        "Add examples and supporting sections"
      ],
      impact: "+9 SEO score"
    })
  }

  if (!signals.hasOpenGraph) {
    recs.push({
      category: "SEO",
      title: "Add Open Graph Metadata",
      why: "Improves social sharing and crawl signals.",
      how: [
        "Add og:title",
        "Add og:description",
        "Add og:image"
      ],
      impact: "+3 SEO score"
    })
  }

  return recs
}

/* ------------------------------
   ENTITY EXTRACTION
--------------------------------*/

function extractEntities(html: string) {

  const text = html.replace(/<[^>]*>/g, " ").toLowerCase()
  const words = text.split(/\s+/).filter(w => w.length > 6)

  const freq: any = {}

  words.forEach(w => {
    freq[w] = (freq[w] || 0) + 1
  })

  return Object.entries(freq)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 6)
    .map(x => x[0])
}

/* ------------------------------
   MAIN ROUTE
--------------------------------*/

export async function POST(req: Request) {

  const { url, competitor } = await req.json()

  const normalized = normalize(url)

  const html = await fetchHtml(normalized)

  if (!html) {
    return NextResponse.json({ error: "Failed to fetch website" })
  }

  const signals = detectSignals(html)

  const scores = buildScores(signals)

  const reasons = buildReasons(signals)

  const recommendations = buildDetailedRecommendations(signals)

  const entities = extractEntities(html)

  const previewImage =
    `https://s.wordpress.com/mshots/v1/${encodeURIComponent(normalized)}?w=1200`

  return NextResponse.json({
    scores,
    reasons,
    recommendations,
    entities,
    previewImage,
    competitor: competitor || null
  })
}
