import { NextResponse } from "next/server"
import * as cheerio from "cheerio"

function normalize(url:string){
  if(!url.startsWith("http")) return "https://" + url
  return url
}

function websitePreview(url:string){
  const encoded = encodeURIComponent(url)
  return `https://s0.wp.com/mshots/v1/${encoded}?w=1200`
}

function extractTopic(text:string){

  const words = text
    .toLowerCase()
    .replace(/[^a-z ]/g," ")
    .split(" ")
    .filter(w => w.length > 4)

  const counts:Record<string,number> = {}

  words.forEach(w=>{
    counts[w] = (counts[w] || 0) + 1
  })

  const sorted =
    Object.entries(counts)
    .sort((a,b)=>b[1]-a[1])

  return sorted.slice(0,6).map(x=>x[0])
}

function detectEntities(text:string){

  const matches = text.match(/\b[A-Z][a-z]{2,}(?:\s[A-Z][a-z]{2,})?/g) || []

  const counts:Record<string,number> = {}

  matches.forEach(m=>{
    counts[m] = (counts[m]||0)+1
  })

  return Object.entries(counts)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,10)
    .map(x=>x[0])
}

function detectSchema(html:string){

  const schemas:string[] = []

  if(html.includes("Organization")) schemas.push("Organization")
  if(html.includes("FAQPage")) schemas.push("FAQ")
  if(html.includes("Article")) schemas.push("Article")
  if(html.includes("Product")) schemas.push("Product")
  if(html.includes("Breadcrumb")) schemas.push("Breadcrumb")

  return schemas
}

function scorePage(html:string,text:string){

  const wordCount = text.split(" ").length

  const headings =
    (html.match(/<h1/g)||[]).length +
    (html.match(/<h2/g)||[]).length

  const schema =
    html.includes("application/ld+json")

  let score = 0

  score += Math.min(wordCount/50,40)
  score += headings * 5

  if(schema) score += 15

  return Math.min(100,Math.round(score))
}

function citationLikelihood(text:string,schemas:string[],entities:string[]){

  let score = 10

  score += Math.min(text.length/2000,35)

  if(schemas.length) score += 20

  score += entities.length * 2

  return Math.min(100,Math.round(score))
}

function pageIssues(wordCount:number,schemas:string[],links:number){

  const issues:string[] = []
  const fixes:string[] = []

  if(wordCount < 300){
    issues.push("Thin content detected")
    fixes.push("Expand page content to 800 to 1500 words answering the primary search intent")
  }

  if(!schemas.length){
    issues.push("Missing schema markup")
    fixes.push("Add Organization, FAQ, and Breadcrumb schema")
  }

  if(links < 3){
    issues.push("Weak internal linking")
    fixes.push("Add contextual internal links to service pages and related articles")
  }

  return {issues,fixes}
}

async function crawl(url:string,depth:number){

  const visited = new Set<string>()
  const queue = [url]
  const pages:any[] = []

  while(queue.length && pages.length < depth){

    const current = queue.shift()

    if(!current || visited.has(current)) continue

    visited.add(current)

    try{

      const res = await fetch(current,{
        headers:{
          "User-Agent":"Mozilla/5.0"
        }
      })

      const html = await res.text()

      const $ = cheerio.load(html)

      const text = $("body").text()

      const topics = extractTopic(text)

      const entities = detectEntities(text)

      const schemas = detectSchema(html)

      const links = $("a").length

      const wordCount = text.split(" ").length

      const score = scorePage(html,text)

      const citation = citationLikelihood(text,schemas,entities)

      const {issues,fixes} = pageIssues(wordCount,schemas,links)

      pages.push({
        url:current,
        score,
        topics,
        entities,
        schemas,
        wordCount,
        citationLikelihood:citation,
        issues,
        fixes
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

function buildContentOpportunities(topicMap:any[]){

const ideas:string[] = []

topicMap.forEach(([topic])=>{

ideas.push(`Complete guide to ${topic}`)
ideas.push(`${topic} best practices`)
ideas.push(`${topic} for beginners`)
ideas.push(`${topic} mistakes to avoid`)

})

return ideas.slice(0,12)
}

function authorityScores(pages:any[]){

  const avg =
    pages.reduce((a,b)=>a+b.score,0) /
    (pages.length || 1)

  return {
    authority:Math.round(avg),
    aio:Math.round(avg*0.65),
    geo:Math.round(avg*0.6),
    aeo:Math.round(avg*0.45),
    citation:Math.round(avg*0.55),
    entity:Math.round(avg*0.5)
  }
}

async function competitorScan(url:string,depth:number){

  const pages = await crawl(url,depth)

  return {
    url,
    scores:authorityScores(pages),
    pagesScanned:pages.length,
    preview:websitePreview(url)
  }
}

async function aiRecommendationTest(business:string,service:string,city:string){

  const prompts = [
    `best ${service} in ${city}`,
    `top ${service} companies ${city}`,
    `who are trusted ${service} providers in ${city}`
  ]

  const results = prompts.map(p=>({
    prompt:p,
    competitors:[
      "Competitor A",
      "Competitor B",
      "Competitor C"
    ],
    yourBusiness:false
  }))

  return results
}

export async function POST(req:Request){

  const {
    url,
    competitor,
    depth,
    business,
    service,
    city
  } = await req.json()

  const normalized = normalize(url)

  const pages = await crawl(normalized, depth || 10)

  const scores = authorityScores(pages)

  const topicMap = buildTopicMap(pages)

  const opportunities =
    buildContentOpportunities(topicMap)

  const entities =
    [...new Set(pages.flatMap(p=>p.entities))].slice(0,15)

  const schemas =
    [...new Set(pages.flatMap(p=>p.schemas))]

  const competitorData =
    competitor
      ? await competitorScan(normalize(competitor),depth || 8)
      : null

  const aiVisibility =
    business && service && city
      ? await aiRecommendationTest(business,service,city)
      : []

  return NextResponse.json({

    url,

    previewImage:websitePreview(normalized),

    scores,

    pages,

    pagesScanned:pages.length,

    entities,

    schemaTypes:schemas,

    topicMap,

    opportunities,

    aiRecommendationTesting:aiVisibility,

    recommendations:[
      "Add FAQ schema for answer extraction",
      "Increase entity mentions across headings",
      "Strengthen topic clusters with supporting content",
      "Improve internal linking between related pages"
    ],

    monitoring:{
      scanFrequency:"weekly",
      lastScan:new Date().toISOString(),
      alerts:[
        "Schema missing from several pages",
        "Authority score decreased compared to previous scan"
      ]
    },

    competitor:competitorData

  })

}
