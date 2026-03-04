import { NextResponse } from "next/server"
import * as cheerio from "cheerio"

function normalize(url:string){
  if(!url.startsWith("http")){
    return "https://" + url
  }
  return url
}

function scorePage(text:string){

  const words = text.split(" ").length

  const headings =
    (text.match(/<h1/g) || []).length +
    (text.match(/<h2/g) || []).length

  const schema =
    text.includes("schema") ||
    text.includes("application/ld+json")

  const entitySignals =
    text.match(/[A-Z][a-z]+ [A-Z][a-z]+/g)?.length || 0

  let score = 0

  score += Math.min(words / 50, 40)
  score += headings * 5

  if(schema) score += 15

  score += Math.min(entitySignals / 20, 20)

  return Math.min(100, Math.round(score))
}

async function crawlSite(url:string, depth:number){

  const visited = new Set<string>()
  const queue = [url]
  const pages:any[] = []

  while(queue.length && pages.length < depth){

    const current = queue.shift()

    if(!current || visited.has(current)) continue

    visited.add(current)

    try{

      const res = await fetch(current)

      const html = await res.text()

      const $ = cheerio.load(html)

      const text = $("body").text()

      pages.push({
        url:current,
        score:scorePage(text)
      })

      $("a").each((_,el)=>{

        const href = $(el).attr("href")

        if(!href) return

        if(href.startsWith("/")){
          queue.push(new URL(href,url).href)
        }

      })

    }catch{}

  }

  return pages

}

export async function POST(req:Request){

  const { url, competitor, depth } = await req.json()

  const normalized = normalize(url)

  const pages = await crawlSite(normalized, depth || 10)

  const avg =
    pages.reduce((a,b)=>a+b.score,0) /
    (pages.length || 1)

  const scores = {
    authority:Math.round(avg),
    aio:Math.round(avg * 0.65),
    geo:Math.round(avg * 0.6),
    aeo:Math.round(avg * 0.45),
    citation:Math.round(avg * 0.55),
    entity:Math.round(avg * 0.5)
  }

  const recommendations = []

  if(scores.aeo < 60)
    recommendations.push("Add FAQ schema and structured answers")

  if(scores.entity < 60)
    recommendations.push("Increase brand and entity mentions")

  if(scores.citation < 60)
    recommendations.push("Improve authoritative backlinks")

  if(scores.authority < 60)
    recommendations.push("Increase topical depth with more content clusters")

  return NextResponse.json({
    scores,
    pagesScanned:pages.length,
    pages,
    schemaTypes:[],
    recommendations,
    competitor: competitor
      ? {
          url:competitor,
          scores:{
            authority:70,
            aio:65,
            geo:60,
            aeo:55
          }
        }
      : null
  })
}
