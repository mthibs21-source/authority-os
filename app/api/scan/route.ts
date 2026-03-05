import { NextResponse } from "next/server"
import * as cheerio from "cheerio"

function clamp(n:number,min=0,max=100){
  return Math.max(min,Math.min(max,n))
}

function score(n:number){
  return Math.round(clamp(n))
}

async function fetchHTML(url:string){

  try{

    const res = await fetch(url,{
      headers:{
        "User-Agent":"Mozilla/5.0 AuthorityOS"
      },
      cache:"no-store"
    })

    return await res.text()

  }catch{
    return ""
  }

}

function detectSchema($:cheerio.CheerioAPI){

  const types:string[]=[]

  $('script[type="application/ld+json"]').each((_,el)=>{

    try{

      const json = JSON.parse($(el).html() || "{}")

      if(Array.isArray(json)){
        json.forEach(j=>{
          if(j["@type"]) types.push(j["@type"])
        })
      }

      if(json["@type"]) types.push(json["@type"])

    }catch{}

  })

  return [...new Set(types)]

}

function detectEntities($:cheerio.CheerioAPI){

  const entities:string[]=[]
  const text = $("body").text()

  if(text.match(/inc|llc|corporation/i)) entities.push("Organization")
  if(text.match(/product/i)) entities.push("Product")
  if(text.match(/service|solution/i)) entities.push("Service")

  if($("footer").text().match(/copyright|©/i)){
    entities.push("Brand")
  }

  return [...new Set(entities)]

}

function scoreAuthority(schema:string[],entities:string[]){

  return score(schema.length*20 + entities.length*20)

}

function scoreAIO($:cheerio.CheerioAPI){

  const headings = $("h1,h2,h3").length
  const paragraphs = $("p").length
  const lists = $("ul,ol").length

  return score(headings*5 + paragraphs*0.4 + lists*3)

}

function scoreGEO($:cheerio.CheerioAPI){

  const links = $("a[href]").length
  const internal = $("a[href^='/']").length

  if(links===0) return 0

  return score((internal/links)*100)

}

function scoreAEO($:cheerio.CheerioAPI){

  const faqSchema = $('[itemtype*="FAQPage"]').length
  const questions = $("h2:contains('?'),h3:contains('?')").length
  const lists = $("ul,ol").length
  const definitions = $("p:contains(' is '),p:contains(' are ')").length

  return score(
    faqSchema*40 +
    questions*5 +
    lists*2 +
    definitions*1
  )

}

/* -----------------------------
   NEW ADVANCED ANALYSIS
--------------------------------*/

function aiCitationLikelihood($:cheerio.CheerioAPI){

  const headings = $("h1,h2,h3").length
  const lists = $("ul,ol").length
  const schema = $('script[type="application/ld+json"]').length
  const paragraphs = $("p").length

  return score(
    headings*4 +
    lists*3 +
    schema*10 +
    paragraphs*0.3
  )

}

function topicalAuthorityScore($:cheerio.CheerioAPI){

  const internalLinks = $("a[href^='/']").length
  const headings = $("h2,h3").length
  const sections = $("section,article").length

  return score(
    internalLinks*1.5 +
    headings*3 +
    sections*5
  )

}

function extractionQuality($:cheerio.CheerioAPI){

  const paragraphs = $("p").length
  const lists = $("ul,ol").length
  const tables = $("table").length

  return score(
    paragraphs*0.5 +
    lists*5 +
    tables*10
  )

}

/* ----------------------------- */

function buildPreview(url:string){

  const encoded = encodeURIComponent(url)

  return `https://s.wordpress.com/mshots/v1/${encoded}?w=1200`

}

async function scanSite(url:string){

  const html = await fetchHTML(url)

  const $ = cheerio.load(html)

  const schemaTypes = detectSchema($)
  const entities = detectEntities($)

  const authority = scoreAuthority(schemaTypes,entities)
  const aio = scoreAIO($)
  const geo = scoreGEO($)
  const aeo = scoreAEO($)

  const aiCitation = aiCitationLikelihood($)
  const topicalAuthority = topicalAuthorityScore($)
  const extractionScore = extractionQuality($)

  return {

    scores:{
      authority,
      aio,
      geo,
      aeo
    },

    /* advanced metrics (UI optional) */

    aiSignals:{
      citationLikelihood:aiCitation,
      topicalAuthority,
      extractionScore
    },

    schemaTypes,
    entities,

    pages:[
      {
        url,
        title:$("title").text(),
        issues:[
          schemaTypes.length ? null : "Missing schema markup",
          entities.length ? null : "Weak entity signals"
        ].filter(Boolean)
      }
    ],

    recommendations:[
      {
        title:"Improve internal linking",
        severity:"Needs Work",
        why:"Helps build topical authority clusters",
        how:"Add contextual links between service pages",
        impact:6
      }
    ]

  }

}

export async function POST(req:Request){

  const {url,competitor} = await req.json()

  if(!url){

    return NextResponse.json({
      error:"URL required"
    },{status:400})

  }

  const main = await scanSite(url)

  let comp=null

  if(competitor){

    const c = await scanSite(competitor)

    comp={
      url:competitor,
      scores:c.scores,
      entities:c.entities,
      schemaTypes:c.schemaTypes
    }

  }

  return NextResponse.json({

    ...main,

    previewImage:buildPreview(url),

    competitor:comp

  })

}
