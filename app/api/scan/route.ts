import { NextResponse } from "next/server"

function normalize(url:string){
  if(!url) return ""
  if(!url.startsWith("http")) return "https://" + url
  return url
}

function clamp(n:number){
  return Math.max(0,Math.min(100,Math.round(n)))
}

async function fetchHtml(url:string){
  try{
    const res = await fetch(url,{
      headers:{ "User-Agent":"AuthorityOS crawler"}
    })
    return await res.text()
  }catch{
    return ""
  }
}

/* ------------------------
SIGNAL DETECTION
------------------------ */

function detectSignals(html:string){

  const text = html.replace(/<[^>]*>/g," ")

  const words = text.split(/\s+/).filter(Boolean)

  return {

    hasFAQSchema: html.includes("FAQPage"),

    hasOpenGraph: html.includes("og:title"),

    hasAltTags: html.includes("alt="),

    hasLists:
      html.includes("<ul") ||
      html.includes("<ol"),

    hasAnswerHeadings:
      html.includes("?") &&
      html.includes("<h"),

    hasDefinitionBlocks:
      text.toLowerCase().includes(" is "),

    internalLinks:
      (html.match(/href="\//g)||[]).length,

    wordCount: words.length

  }

}

/* ------------------------
SCORE ENGINE
------------------------ */

function buildScores(s:any){

  let authority = 50
  let aio = 40
  let geo = 40
  let aeo = 30

  if(s.hasOpenGraph) authority += 10
  if(s.internalLinks > 10) authority += 10
  if(s.wordCount > 800) authority += 10

  if(s.hasLists) aio += 10
  if(s.hasDefinitionBlocks) aio += 10

  if(s.internalLinks > 12) geo += 10

  if(s.hasFAQSchema) aeo += 20
  if(s.hasAnswerHeadings) aeo += 10

  return {
    authority: clamp(authority),
    aio: clamp(aio),
    geo: clamp(geo),
    aeo: clamp(aeo)
  }

}

/* ------------------------
RECOMMENDATIONS
------------------------ */

function buildRecommendations(s:any){

  const recs:any[]=[]

  if(!s.hasFAQSchema){

    recs.push({
      category:"AEO",
      title:"Add FAQ Schema",
      why:"AI engines extract answers directly from FAQ structured data.",
      how:[
        "Create FAQ sections with 3–5 questions",
        "Add JSON-LD FAQPage schema"
      ]
    })

  }

  if(!s.hasLists){

    recs.push({
      category:"AIO",
      title:"Add Structured Lists",
      why:"AI systems extract information easier from lists.",
      how:[
        "Convert paragraphs into bullet lists",
        "Use numbered steps"
      ]
    })

  }

  if(s.internalLinks < 8){

    recs.push({
      category:"GEO",
      title:"Improve Internal Linking",
      why:"Internal linking builds topical authority clusters.",
      how:[
        "Link related pages",
        "Add contextual anchor text"
      ]
    })

  }

  if(s.wordCount < 600){

    recs.push({
      category:"SEO",
      title:"Increase Content Depth",
      why:"Longer content improves topical authority.",
      how:[
        "Expand page to 800–1500 words",
        "Add examples and sections"
      ]
    })

  }

  return recs

}

/* ------------------------
ENTITY EXTRACTION
------------------------ */

function extractEntities(html:string){

  const text = html.replace(/<[^>]*>/g," ").toLowerCase()

  const words = text.split(/\s+/).filter(w=>w.length>6)

  const freq:any={}

  words.forEach(w=>{
    freq[w]=(freq[w]||0)+1
  })

  return Object.entries(freq)
    .sort((a:any,b:any)=>b[1]-a[1])
    .slice(0,6)
    .map(x=>x[0])

}

/* ------------------------
SCAN SITE
------------------------ */

async function scanSite(url:string){

  const html = await fetchHtml(url)

  if(!html) return null

  const signals = detectSignals(html)

  const scores = buildScores(signals)

  const recommendations = buildRecommendations(signals)

  const entities = extractEntities(html)

  return {
    scores,
    recommendations,
    entities
  }

}

/* ------------------------
MAIN ROUTE
------------------------ */

export async function POST(req:Request){

  const {url,competitor} = await req.json()

  const siteUrl = normalize(url)
  const competitorUrl = normalize(competitor)

  const site = await scanSite(siteUrl)

  if(!site){
    return NextResponse.json({
      error:"Failed to fetch site"
    })
  }

  let competitorData = null

  if(competitorUrl){

    competitorData = await scanSite(competitorUrl)

  }

  const previewImage =
    `https://s.wordpress.com/mshots/v1/${encodeURIComponent(siteUrl)}?w=1200`

  return NextResponse.json({

    scores: site.scores,

    competitorScores: competitorData?.scores || null,

    recommendations: site.recommendations,

    entities: site.entities,

    previewImage

  })

}
