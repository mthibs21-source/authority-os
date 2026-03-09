import { NextResponse } from "next/server"

/* -----------------------------
HELPERS
----------------------------- */

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
      headers:{ "User-Agent":"AuthorityOS crawler" }
    })
    return await res.text()
  }catch{
    return ""
  }
}

/* -----------------------------
CRAWL INTERNAL PAGES
----------------------------- */

async function crawlSite(startUrl:string,limit=4){

  const html = await fetchHtml(startUrl)

  if(!html) return {pages:[],html}

  const links = Array.from(
    html.matchAll(/href="(\/[^"]*)"/g)
  ).map(x=>x[1])

  const unique = [...new Set(links)].slice(0,limit)

  const pages:any[] = []

  for(const link of unique){

    const url = startUrl.replace(/\/$/,"") + link

    const pageHtml = await fetchHtml(url)

    pages.push({
      url,
      html:pageHtml
    })

  }

  return {pages,html}

}

/* -----------------------------
SIGNAL DETECTION
----------------------------- */

function detectSignals(html:string,pages:any[]){

  const combined = html + pages.map(p=>p.html).join(" ")

  const text = combined.replace(/<[^>]*>/g," ")

  const words = text.split(/\s+/).filter(Boolean)

  return {

    hasFAQSchema: combined.includes("FAQPage"),

    hasOpenGraph: combined.includes("og:title"),

    hasAltTags: combined.includes("alt="),

    hasLists:
      combined.includes("<ul") ||
      combined.includes("<ol"),

    hasAnswerHeadings:
      combined.includes("?") &&
      combined.includes("<h"),

    hasDefinitionBlocks:
      text.toLowerCase().includes(" is "),

    hasTopicClusters:
      pages.length > 2,

    hasLLMSTxt:
      combined.includes("llms.txt"),

    internalLinks:
      (combined.match(/href="\//g)||[]).length,

    wordCount: words.length,

    pageCount: pages.length + 1

  }

}

/* -----------------------------
SCORE ENGINE
----------------------------- */

function buildScores(s:any){

  let authority = 50
  let aio = 40
  let geo = 40
  let aeo = 30

  if(s.hasOpenGraph) authority += 10
  if(s.internalLinks > 10) authority += 10
  if(s.wordCount > 800) authority += 10
  if(s.pageCount > 2) authority += 10

  if(s.hasLists) aio += 10
  if(s.hasDefinitionBlocks) aio += 10

  if(s.internalLinks > 12) geo += 10
  if(s.hasTopicClusters) geo += 10

  if(s.hasFAQSchema) aeo += 20
  if(s.hasAnswerHeadings) aeo += 10

  return {
    authority:clamp(authority),
    aio:clamp(aio),
    geo:clamp(geo),
    aeo:clamp(aeo)
  }

}

/* -----------------------------
REASONS
----------------------------- */

function buildReasons(s:any){

  const reasons:any={
    authority:[],
    aio:[],
    geo:[],
    aeo:[]
  }

  if(!s.hasOpenGraph)
    reasons.authority.push("Missing Open Graph metadata")

  if(s.internalLinks<8)
    reasons.authority.push("Weak internal linking")

  if(!s.hasLists)
    reasons.aio.push("Content lacks structured lists")

  if(!s.hasDefinitionBlocks)
    reasons.aio.push("Key terms lack clear definitions")

  if(!s.hasTopicClusters)
    reasons.geo.push("No strong topical clusters")

  if(s.internalLinks<10)
    reasons.geo.push("Limited internal linking depth")

  if(!s.hasFAQSchema)
    reasons.aeo.push("Missing FAQ structured data")

  if(!s.hasAnswerHeadings)
    reasons.aeo.push("Pages lack question headings")

  return reasons

}

/* -----------------------------
RECOMMENDATIONS
----------------------------- */

function buildRecommendations(s:any){

  const recs:any[]=[]

  if(!s.hasFAQSchema){

    recs.push({
      category:"AEO",
      title:"Add FAQ Schema",
      why:"AI engines extract answers directly from FAQ structured data.",
      how:[
        "Create FAQ sections with 3–5 questions",
        "Add JSON-LD FAQPage schema",
        "Place schema in page head"
      ],
      impact:"+12 AEO score"
    })

  }

  if(!s.hasAnswerHeadings){

    recs.push({
      category:"AEO",
      title:"Use Question Headings",
      why:"AI search systems prefer question-based headings.",
      how:[
        "Add headings like 'What is…'",
        "Follow with concise answers"
      ],
      impact:"+8 AEO score"
    })

  }

  if(!s.hasLists){

    recs.push({
      category:"AIO",
      title:"Add Structured Lists",
      why:"AI systems extract information easier from lists.",
      how:[
        "Convert sections into bullet lists",
        "Use numbered steps"
      ],
      impact:"+10 AIO score"
    })

  }

  if(!s.hasDefinitionBlocks){

    recs.push({
      category:"AIO",
      title:"Add Definition Sentences",
      why:"AI models rely on clear definitions.",
      how:[
        "Define important terms",
        "Use simple explanatory sentences"
      ],
      impact:"+7 AIO score"
    })

  }

  if(s.internalLinks<8){

    recs.push({
      category:"GEO",
      title:"Improve Internal Linking",
      why:"Internal links build topical authority clusters.",
      how:[
        "Link related content together",
        "Use descriptive anchor text"
      ],
      impact:"+10 GEO score"
    })

  }

  if(!s.hasTopicClusters){

    recs.push({
      category:"GEO",
      title:"Create Topic Clusters",
      why:"Search engines reward deep topic coverage.",
      how:[
        "Create pillar pages",
        "Add supporting topic articles"
      ],
      impact:"+12 GEO score"
    })

  }

  if(!s.hasAltTags){

    recs.push({
      category:"SEO",
      title:"Add Alt Tags to Images",
      why:"Alt attributes help search engines understand images.",
      how:[
        "Add descriptive alt text",
        "Include relevant keywords"
      ],
      impact:"+5 SEO score"
    })

  }

  if(s.wordCount<600){

    recs.push({
      category:"SEO",
      title:"Increase Content Depth",
      why:"Longer content builds topical authority.",
      how:[
        "Expand pages to 800–1500 words",
        "Add supporting sections"
      ],
      impact:"+9 SEO score"
    })

  }

  if(!s.hasOpenGraph){

    recs.push({
      category:"SEO",
      title:"Add Open Graph Metadata",
      why:"Improves social sharing and crawl signals.",
      how:[
        "Add og:title",
        "Add og:description",
        "Add og:image"
      ],
      impact:"+3 SEO score"
    })

  }

  return recs

}

/* -----------------------------
ENTITY EXTRACTION
----------------------------- */

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

/* -----------------------------
MAIN API
----------------------------- */

export async function POST(req:Request){

  const {url,competitor}=await req.json()

  const normalized = normalize(url)

  const {pages,html}=await crawlSite(normalized)

  if(!html){

    return NextResponse.json({
      error:"Failed to fetch site"
    })

  }

  const signals = detectSignals(html,pages)

  const scores = buildScores(signals)

  const reasons = buildReasons(signals)

  const recommendations = buildRecommendations(signals)

  const entities = extractEntities(html)

  const previewImage =
    `https://s.wordpress.com/mshots/v1/${encodeURIComponent(normalized)}?w=1200`

  return NextResponse.json({

    scores,

    reasons,

    recommendations,

    pages:pages.map(p=>({
      url:p.url,
      issues:[]
    })),

    entities,

    schemaTypes:signals.hasFAQSchema
      ? ["FAQPage","Organization"]
      : ["Organization"],

    previewImage,

    competitor: competitor || null

  })

}
