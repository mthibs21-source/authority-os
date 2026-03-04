import { NextResponse } from "next/server"

function extract(text: string, regex: RegExp) {
  const match = text.match(regex)
  return match ? match.length : 0
}

export async function POST(req: Request) {

  try {

    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 })
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; AuthorityOSBot/1.0)"
      }
    })

    const html = await response.text()

    const title = extract(html, /<title>/gi)
    const h1 = extract(html, /<h1/gi)
    const h2 = extract(html, /<h2/gi)
    const schema = extract(html, /application\/ld\+json/gi)
    const meta = extract(html, /meta name="description"/gi)
    const faq = extract(html, /faq/gi)

    let authority = 40
    let aio = 40
    let geo = 40
    let aeo = 40

    if (title) authority += 5
    if (meta) authority += 5
    if (h1) authority += 5
    if (h2 > 2) authority += 10
    if (schema) aio += 15
    if (faq) aeo += 10

    authority = Math.min(100, authority)
    aio = Math.min(100, aio)
    geo = Math.min(100, geo + h2 * 2)
    aeo = Math.min(100, aeo)

    const recommendations: string[] = []

    if (!schema)
      recommendations.push("Add structured data schema markup")

    if (h1 === 0)
      recommendations.push("Add a clear H1 heading to your page")

    if (h2 < 3)
      recommendations.push("Increase content structure with H2 sections")

    if (!meta)
      recommendations.push("Add a meta description for better SEO signals")

    if (!faq)
      recommendations.push("Add an FAQ section for AI search visibility")

    return NextResponse.json({
      scores: {
        authority,
        aio,
        geo,
        aeo
      },
      recommendations
    })

  } catch (error) {

    return NextResponse.json(
      { error: "Scan failed" },
      { status: 500 }
    )

  }

}
