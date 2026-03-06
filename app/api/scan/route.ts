import { NextResponse } from "next/server"
import * as cheerio from "cheerio"

function normalize(url:string){
  if(!url.startsWith("http")) return "https://" + url
  return url
}

function clamp(n:number){
  return Math.max(0,Math.min(100,Math.round(n)))
}

async function fetchHtml(url:string){

  try{

    const res = await fetch(url,{
      headers:{
        "User-Agent":"Mozilla/5.0 AuthorityOS crawler"
      }
    })

    return await res.text()

  }catch{
    return null
  }

}

/* ================= PAGE ANALYSIS ================= */

function analyzePage($:any,url:string){

  const title = $("title").text() || ""
  const h1 = $("h1").length
  const h2 = $("h2").length
  const lists = $("ul,ol").length
  const internalLinks = $('a[href^="/"]').length
  const faq = $('[itemtype*="FAQPage"]').length
  const schema = $('script[type="application/ld+json"]').length
  const paragraphs = $("p").length

  const issues:string[] = []
  const recommendations:string[] = []

  if(h1 === 0){
    issues.push("Missing H1 heading")
    recommendations.push("Add a clear H1 describing the page topic")
  }

  if(schema === 0){
    issues.push("No structured schema detected")
    recommendations.push("Add JSON-LD schema such as Organization, Website, or FAQ")
  }

  if(lists < 2){
    issues.push("Content lacks structured lists")
    recommendations.push("Use bullet lists to improve AI answer extraction")
  }

  if(internalLinks < 4){
    issues.push("Weak internal linking")
    recommendations.push("Add contextual links to related service and guide pages")
  }

  const score =
    (title.length > 20 ? 10 : 0) +
    (h1 > 0 ? 10 : 0) +
    (h2 * 4) +
    (lists * 3) +
    (internalLinks * 2) +
    (schema > 0 ? 20 : 0) +
    paragraphs

  return {
    url,
    title,
    score:clamp(score),
    issues,
    recommendations
  }

}

/* ================= SCORE ENGINE ================= */

function buildScores(pages:any[]){

  const avg =
    pages.reduce((a,b)=>a+b.score,0) /
    (pages.length || 1)

  const authority = clamp(avg)

  const aio = clamp(avg * 0.7)
  const geo = clamp(avg * 0.6)
  const aeo = clamp(avg * 0.5)
  const citation = clamp(avg * 0.55)

  return {authority,aio,geo,aeo,citation}

}

/* ================= REASON ENGINE ================= */

function buildReasons($:any){

  const schema = $('script[type="application/ld+json"]').length
  const faq = $('[itemtype*="FAQPage"]').length
  const headings = $("h2,h3").length
  const lists = $("ul,ol").length
  const internalLinks = $('a[href^="/"]').length

  const reasons:any = {
    authority:[],
    aio:[],
    geo:[],
    aeo:[]
  }

  if(schema === 0)
    reasons.authority.push("Search engines cannot verify site structure without schema markup")

  if(internalLinks < 8)
    reasons.authority.push("Internal linking is weak, reducing topical authority signals")

  if(lists < 3)
    reasons.aio.push("AI cannot easily extract answers because structured lists are missing")

  if(headings < 6)
    reasons.aio.push("Content lacks clear headings answering search questions")

  if(internalLinks < 10)
    reasons.geo.push("Topical authority clusters are weak due to limited internal linking")

  if(headings < 8)
    reasons.geo.push("Supporting content sections are too shallow for strong topic coverage")

  if(faq === 0)
    reasons.aeo.push("FAQ schema is missing which helps AI extract direct answers")

  if(headings < 5)
    reasons.aeo.push("Question based headings are missing which improves AI answer extraction")

  return reasons

}

/* ================= RECOMMENDATION ENGINE ================= */

function buildRecommendations(reasons:any){

  const list:any[] = []

  reasons.authority.forEach((r:string)=>{
    list.push({
      title:r,
      severity:"Needs Work",
      why:"Improving this signal helps search engines trust your site structure",
      how:"Add organization schema, improve linking, and strengthen trust signals",
      impact:8
    })
  })

  reasons.aio.forEach((r:string)=>{
    list.push({
      title:r,
      severity:"Critical",
      why:"AI engines rely on structured formatting to extract answers",
      how:"Add lists, definition paragraphs, and intent based headings",
      impact:9
    })
  })

  reasons.geo.forEach((r:string)=>{
    list.push({
      title:r,
      severity:"Needs Work",
      why:"Search engines rank sites with strong topic clusters higher",
      how:"Create topic clusters and connect them using internal links",
      impact:7
    })
  })

  reasons.aeo.forEach((r:string)=>{
    list.push({
      title:r,
      severity:"Critical",
      why:"Answer engine optimization requires clear Q&A formatting",
      how:"Add FAQ schema and question headings to improve answer extraction",
      impact:9
    })
  })

  return list

}

/* ================= ENTITY DETECTION ================= */

function extractEntities(text:string){

  const words =
    text
    .toLowerCase()
    .replace(/[^a-z ]/g,"")
    .split(" ")
    .filter(w => w.length > 5)

  const map:any = {}

  words.forEach(w=>{
    map[w] = (map[w] || 0) + 1
  })

  return Object
    .entries(map)
    .sort((a:any,b:any)=>b[1]-a[1])
    .slice(0,8)
    .map(x=>x[0])

}

/* ================= MAIN SCAN ================= */

export async function POST(req:Request){

  const { url, competitor, depth } = await req.json()

  const normalized = normalize(url)

  const html = await fetchHtml(normalized)

  if(!html){
    return NextResponse.json({error:"Unable to fetch site"})
  }

  const $ = cheerio.load(html)

  const pages:any[] = []

  pages.push(analyzePage($,normalized))

  const scores = buildScores(pages)

  const reasons = buildReasons($)

  const recommendations = buildRecommendations(reasons)

  const entities = extractEntities($("body").text())

  const schemaTypes =
    $('script[type="application/ld+json"]')
      .map((_:any,el:any)=>{
        const json = $(el).html() || ""
        if(json.includes("FAQ")) return "FAQPage"
        if(json.includes("Organization")) return "Organization"
        if(json.includes("Product")) return "Product"
        return "StructuredData"
      })
      .get()

  const previewImage =
    `https://s.wordpress.com/mshots/v1/${encodeURIComponent(normalized)}?w=1200`

  return NextResponse.json({

    scores,
    reasons,
    recommendations,
    pages,
    entities,
    schemaTypes,
    previewImage,

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
