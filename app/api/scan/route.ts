import { NextResponse } from "next/server"
import * as cheerio from "cheerio"

type Scores = {
  authority:number
  aio:number
  geo:number
  aeo:number
}

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
        "User-Agent":"Mozilla/5.0 AuthorityOS Scanner"
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

  if(text.match(/inc|llc|ltd|corporation/i)) entities.push("Organization")
  if(text.match(/product/i)) entities.push("Product")
  if(text.match(/service|solutions/i)) entities.push("Service")

  if($("footer").text().match(/©|copyright/i)){
    entities.push("Brand")
  }

  return [...new Set(entities)]

}

function scoreAuthority(schema:string[],entities:string[]){

  const schemaScore = schema.length * 18
  const entityScore = entities.length * 22

  return score(schemaScore + entityScore)

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

  const ratio = internal / links

  return score(ratio * 100)

}

function scoreAEO($:cheerio.CheerioAPI){

  const faqSchema = $('[itemtype*="FAQPage"]').length
  const questions = $("h2:contains('?'),h3:contains('?')").length

  return score(faqSchema*40 + questions*3)

}

function buildRecommendations(schema:string[],entities:string[]){

  const recs:any[]=[]

  if(schema.length===0){

    recs.push({
      title:"Add structured schema markup",
      severity:"Critical",
      why:"Schema allows AI and search engines to identify your entity and relationships.",
      how:"Add Organization, Website and FAQ schema to your site.",
      impact:9
    })

  }

  if(!entities.includes("Organization")){

    recs.push({
      title:"Strengthen organization entity",
      severity:"Needs Work",
      why:"AI models rely on strong entity recognition.",
      how:"Add About page, Organization schema and clear brand references.",
      impact:7
    })

  }

  recs.push({
    title:"Improve internal linking",
    severity:"Needs Work",
    why:"Improves topical authority clusters and page discovery.",
    how:"Add contextual links between related pages.",
    impact:6
  })

  return recs

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

  return {

    scores:{
      authority,
      aio,
      geo,
      aeo
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

    recommendations:buildRecommendations(schemaTypes,entities)

  }

}

function preview(url:string){

  const encoded = encodeURIComponent(url)

  return `https://s.wordpress.com/mshots/v1/${encoded}?w=1200`

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

    previewImage:preview(url),

    competitor:comp

  })

}
