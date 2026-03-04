import axios from "axios"
import * as cheerio from "cheerio"
import OpenAI from "openai"

export async function POST(req: Request) {
  const { url } = await req.json()

  try {
    const response = await axios.get(url)
    const html = response.data
    const $ = cheerio.load(html)

    const title = $("title").text()
    const description = $('meta[name="description"]').attr("content") || ""
    const h1Count = $("h1").length
    const wordCount = $("body").text().split(/\s+/).length
    const hasSchema = $('script[type="application/ld+json"]').length > 0

    let score = 0
    if (title.length > 20 && title.length < 65) score += 25
    if (description.length > 120) score += 25
    if (h1Count === 1) score += 25
    if (wordCount > 600) score += 25

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    const ai = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an SEO expert."
        },
        {
          role: "user",
          content: `Analyze this SEO data and give improvement recommendations:
          
          Title: ${title}
          Description: ${description}
          H1 count: ${h1Count}
          Word count: ${wordCount}
          Schema: ${hasSchema}`
        }
      ]
    })

    return Response.json({
      score,
      title,
      description,
      h1Count,
      wordCount,
      hasSchema,
      recommendations: ai.choices[0].message.content
    })
  } catch (error) {
    return Response.json({ error: "Failed to scan site" }, { status: 500 })
  }
}
