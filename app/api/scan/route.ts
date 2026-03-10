import { NextResponse } from "next/server"
import * as cheerio from "cheerio"

async function fetchHTML(url: string) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  })

  const html = await res.text()
  return html
}

function detectSchema($: any) {
  const schemas: string[] = []

  $('script[type="application/ld+json"]').each((_: any, el: any) => {
    try {
      const json = JSON.parse($(el).html())
      if (json["@type"]) schemas.push(json["@type"])
    } catch {}
  })

  return schemas
}

function detectFAQ($: any) {
  let faqFound = false

  $("h2,h3").each((_: any, el: any) => {
    const text = $(el).text().toLowerCase()

    if (
      text.includes("faq") ||
      text.includes("question") ||
      text.includes("frequently asked")
    ) {
      faqFound = true
    }
  })

  return faqFound
}

function countInternalLinks($: any, domain: string) {
  let count = 0

  $("a").each((_: any, el: any) => {
    const href = $(el).attr("href")

    if (href && href.includes(domain)) {
      count++
    }
  })

  return count
}

function scoreAuthority(schemaCount: number, internalLinks: number) {
  let score = 40

  if (schemaCount > 0) score += 20
  if (internalLinks > 20) score += 20
  if (internalLinks > 50) score += 20

  return Math.min(score, 100)
}

function scoreAEO(faq: boolean) {
  return faq ? 80 : 30
}

function scoreAIO(schemaCount: number) {
  return schemaCount > 0 ? 75 : 40
}

function scoreGEO(internalLinks: number) {
  if (internalLinks > 50) return 80
  if (internalLinks > 20) return 60
  return 35
}

export async function POST(req: Request) {
  try {

    const { website, competitor } = await req.json()

    if (!website) {
      return NextResponse.json({ error: "Missing website" })
    }

    const html = await fetchHTML(website)

    const $ = cheerio.load(html)

    const schema = detectSchema($)
    const faq = detectFAQ($)
    const links = countInternalLinks($, website)

    const authority = scoreAuthority(schema.length, links)
    const aeo = scoreAEO(faq)
    const aio = scoreAIO(schema.length)
    const geo = scoreGEO(links)

    const recommendations = []

    if (!faq) {
      recommendations.push({
        category: "AEO",
        title: "Add FAQ sections",
        reason: "Answer engines extract structured question-answer content",
        fix: "Add FAQ blocks with schema markup to service pages"
      })
    }

    if (schema.length === 0) {
      recommendations.push({
        category: "AIO",
        title: "Add schema markup",
        reason: "AI relies heavily on structured data",
        fix: "Add Organization and WebSite schema"
      })
    }

    if (links < 20) {
      recommendations.push({
        category: "GEO",
        title: "Improve internal linking",
        reason: "AI needs topical authority clusters",
        fix: "Add contextual links between related pages"
      })
    }

    return NextResponse.json({
      scores: {
        authority,
        aio,
        geo,
        aeo
      },
      schemaDetected: schema,
      faqDetected: faq,
      internalLinks: links,
      recommendations
    })

  } catch (err) {

    return NextResponse.json({
      error: "Scan failed"
    })

  }
}
