import { NextResponse } from "next/server"
import * as cheerio from "cheerio"

function normalize(url:string){

  if(!url.startsWith("http")){
    return "https://" + url
  }

  return url
}

function score(text:string){

  const words = text.split(" ").length

  const schema = text.includes("schema") ? 10 : 0

  const headings =
    (text.match(/<h1/g) || []).length +
    (text.match(/<h2/g) || []).length

  const base = Math.min(words / 40, 50)

  return Math.min(100, Math.round(base + headings * 5 + schema))

}

async function crawl(url:string, depth:number){

  const visited = new Set<string>()
  const pages:any[] = []

  const queue = [url]

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
        score:score(text)
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

  const pages = await crawl(normalized, depth || 10)

  const avg =
    pages.reduce((a,b)=>a+b.score,0) /
    (pages.length || 1)

  const scores = {
    authority:Math.round(avg),
    aio:Math.round(avg * 0.6),
    geo:Math.round(avg * 0.6),
    aeo:Math.round(avg * 0.4),
    citation:Math.round(avg * 0.5),
    entity:Math.round(avg * 0.5)
  }

  return NextResponse.json({

    scores,

    pagesScanned:pages.length,

    pages,

    schemaTypes:[],

    recommendations:[
      "Add structured data schema",
      "Increase topical depth",
      "Improve entity signals",
      "Add FAQ schema",
      "Strengthen internal linking"
    ],

    competitor: competitor
      ? {
          url: competitor,
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
