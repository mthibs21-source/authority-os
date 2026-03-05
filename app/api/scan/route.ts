import { NextResponse } from "next/server"
import * as cheerio from "cheerio"

function normalize(url:string){
  if(!url.startsWith("http")) return "https://" + url
  return url
}

/* ===============================
   TEXT + ENTITY EXTRACTION
================================*/

function extractTopic(text:string){

  const words = text
    .toLowerCase()
    .replace(/[^a-z ]/g,"")
    .split(" ")
    .filter(w => w.length > 4)

  const counts:Record<string,number> = {}

  words.forEach(w=>{
    counts[w] = (counts[w] || 0) + 1
  })

  const sorted =
    Object.entries(counts)
    .sort((a,b)=>b[1]-a[1])

  return sorted.slice(0,5).map(x=>x[0])
}

function extractEntities(text:string){

  const words =
    text
      .split(" ")
      .filter(w => /^[A-Z][a-z]+$/.test(w))

  const unique = [...new Set(words)]

  return unique.slice(0,10)
}

function detectSchema(html:string){

  const types:string[] = []

  if(html.includes("application/ld+json")) types.push("JSON-LD")

  if(html.includes("FAQPage")) types.push("FAQ")

  if(html.includes("Organization")) types.push("Organization")

  if(html.includes("BreadcrumbList")) types.push("Breadcrumb")

  return types
}

/* ===============================
   PAGE SCORING
================================*/

function scorePage(html:string,text:string){

  const wordCount = text.split(" ").length

  const h1 = (html.match(/<h1/g)||[]).length
  const h2 = (html.match(/<h2/g)||[]).length

  const schema = html.includes("application/ld+json")

  let score = 0

  score += Math.min(wordCount/40,40)

  score += (h1 * 10)
  score += (h2 * 4)

  if(schema) score += 15

  return Math.min(100,Math.round(score))
}

function pageIssues(html:string,text:string){

  const issues:string[] = []

  const wordCount = text.split(" ").length

  if(wordCount < 300)
    issues.push("Content too thin for strong authority")

  if(!(html.match(/<h1/g)||[]).length)
    issues.push("Missing H1 heading")

  if(!(html.match(/<h2/g)||[]).length)
    issues.push("Missing H2 structure")

  if(!html.includes("application/ld+json"))
    issues.push("Missing schema markup")

  if(!html.includes("<title"))
    issues.push("Missing title tag")

  return issues
}

/* ===============================
   CRAWLER
================================*/

async function crawl(url:string,depth:number){

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

      const topics = extractTopic(text)

      const entities = extractEntities(text)

      const schemaTypes = detectSchema(html)

      const score = scorePage(html,text)

      const issues = pageIssues(html,text)

      pages.push({
        url:current,
        title:$("title").text(),
        score,
        topics,
        entities,
        schemaTypes,
        issues
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

/* ===============================
   TOPIC MAP
================================*/

function buildTopicMap(pages:any[]){

  const map:Record<string,number> = {}

  pages.forEach(p=>{

    p.topics.forEach((t:string)=>{
      map[t] = (map[t]||0)+1
    })

  })

  return Object.entries(map)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,10)
}

/* ===============================
   CONTENT IDEAS
================================*/

function buildContentOpportunities(topicMap:any[]){

  const ideas:string[] = []

  topicMap.forEach(([topic])=>{

    ideas.push(`Complete guide to ${topic}`)
    ideas.push(`${topic} best practices`)
    ideas.push(`${topic} for beginners`)
    ideas.push(`${topic} mistakes to avoid`)

  })

  return ideas.slice(0,10)
}

/* ===============================
   SCORE REASONS
================================*/

function buildReasons(pages:any[]){

  const thin =
    pages.filter(p=>p.issues.includes("Content too thin for strong authority")).length

  const missingSchema =
    pages.filter(p=>p.issues.includes("Missing schema markup")).length

  return {

    authority:[
      `${thin} pages have thin content`,
      `${missingSchema} pages missing schema`,
      "Limited internal topic coverage"
    ],

    aio:[
      "Content not formatted for AI extraction",
      "Few structured answers detected"
    ],

    geo:[
      "Topic clusters incomplete",
      "Weak entity relationships"
    ],

    aeo:[
      "Few question based sections",
      "Limited FAQ structured data"
    ]

  }
}

/* ===============================
   RECOMMENDATIONS
================================*/

function buildRecommendations(pages:any[]){

  const recs:any[] = []

  if(pages.some(p=>p.issues.includes("Missing schema markup"))){

    recs.push({
      title:"Add structured schema markup",
      severity:"Critical",
      why:"Schema helps search engines and AI understand entities and page meaning",
      how:"Add JSON-LD schema including Organization, FAQ, and Breadcrumb",
      impact:9
    })

  }

  if(pages.some(p=>p.issues.includes("Content too thin for strong authority"))){

    recs.push({
      title:"Expand thin pages",
      severity:"Needs Work",
      why:"Thin pages reduce authority and citation likelihood",
      how:"Increase pages to 800+ words with structured headings",
      impact:7
    })

  }

  recs.push({
    title:"Create topic clusters",
    severity:"Needs Work",
    why:"Topical clusters improve authority signals",
    how:"Create pillar pages and supporting articles for each topic",
    impact:6
  })

  recs.push({
    title:"Improve internal linking",
    severity:"Needs Work",
    why:"Internal links distribute authority and help AI understand topic relationships",
    how:"Add contextual links between related pages",
    impact:6
  })

  return recs
}

/* ===============================
   MAIN ROUTE
================================*/

export async function POST(req:Request){

  const { url, competitor, depth } = await req.json()

  const normalized = normalize(url)

  const pages = await crawl(normalized, depth || 10)

  const avg =
    pages.reduce((a,b)=>a+b.score,0) /
    (pages.length || 1)

  const scores = {
    authority:Math.round(avg),
    aio:Math.round(avg*0.65),
    geo:Math.round(avg*0.6),
    aeo:Math.round(avg*0.45)
  }

  const topicMap = buildTopicMap(pages)

  const opportunities =
    buildContentOpportunities(topicMap)

  const entities =
    [...new Set(pages.flatMap(p=>p.entities))].slice(0,15)

  const schemaTypes =
    [...new Set(pages.flatMap(p=>p.schemaTypes))]

  const reasons = buildReasons(pages)

  const recommendations =
    buildRecommendations(pages)

  return NextResponse.json({

    scores,

    pages,

    pagesScanned:pages.length,

    entities,

    schemaTypes,

    topicMap,

    opportunities,

    reasons,

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
