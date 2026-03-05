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

async function fetchHTML(url:string){
  try{
    const res = await fetch(url,{
      headers:{
        "User-Agent":"AuthorityOS Bot"
      }
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
      }else if(json["@type"]){
        types.push(json["@type"])
      }

    }catch{}
  })

  return [...new Set(types)]
}

function detectEntities($:cheerio.CheerioAPI){

  const entities:string[]=[]

  const text = $("body").text()

  if(text.match(/Inc|LLC|Ltd|Corporation/i)) entities.push("Organization")
  if(text.match(/service|solutions|platform/i)) entities.push("Service")
  if(text.match(/product|pricing/i)) entities.push("Product")

  if($("footer").text().match(/©|copyright/i)){
    entities.push("Brand")
  }

  return [...new Set(entities)]
}

function scoreAIO($:cheerio.CheerioAPI){

  const paragraphs = $("p").length
  const headings = $("h1,h2,h3").length

  const answerBlocks = $("p").filter((_,p)=>{
    const text = $(p).text()
    return text.length > 80 && text.length < 400
  }).length

  return clamp((answerBlocks*2 + headings)/3)
}

function scoreAEO($:cheerio.CheerioAPI){

  const faq = $('[itemtype*="FAQPage"]').length
  const questions = $("h2:contains('?'),h3:contains('?')").length

  return clamp((faq*40 + questions*3))
}

function scoreGEO($:cheerio.CheerioAPI){

  const links = $("a[href]").length
  const internal = $("a[href^='/'],a[href*='"+$("base").attr("href")+"']").length

  return clamp((internal/links)*100 || 20)
}

function scoreAuthority(schema:string[],entities:string[]){

  const schemaScore = schema.length * 12
  const entityScore = entities.length * 18

  return clamp(schemaScore + entityScore)
}

function buildRecommendations(schema:string[],entities:string[]){

  const recs:any[]=[]

  if(schema.length===0){
    recs.push({
      title:"Add structured schema markup",
      severity:"Critical",
      why:"Schema helps AI identify entities and relationships",
      how:"Add Organization, Website and FAQ schema",
      impact:9
    })
  }

  if(!entities.includes("Organization")){
    recs.push({
      title:"Strengthen organization entity",
      severity:"Needs Work",
      why:"AI systems rely on strong brand entities",
      how:"Add About page and organization schema",
      impact:7
    })
  }

  recs.push({
    title:"Improve internal linking",
    severity:"Needs Work",
    why:"Helps build topical authority clusters",
    how:"Add contextual links between service pages",
    impact:6
  })

  return recs
}

async function scanSite(url:string){

  const html = await fetchHTML(url)
  const $ = cheerio.load(html)

  const schemaTypes = detectSchema($)
  const entities = detectEntities($)

  const aio = scoreAIO($)
  const aeo = scoreAEO($)
  const geo = scoreGEO($)
  const authority = scoreAuthority(schemaTypes,entities)

  return {

    scores:{
      authority,
      aio,
      geo,
      aeo
    },

    entities,
    schemaTypes,

    recommendations:buildRecommendations(schemaTypes,entities),

    pages:[
      {
        url,
        title:$("title").text(),
        issues:[
          schemaTypes.length?null:"Missing schema markup",
          entities.length?null:"Weak entity signals"
        ].filter(Boolean)
      }
    ]
  }
}

export async function POST(req:Request){

  const {url,competitor}=await req.json()

  if(!url){
    return NextResponse.json({error:"URL required"},{status:400})
  }

  const main = await scanSite(url)

  let compData=null

  if(competitor){
    const comp = await scanSite(competitor)

    compData={
      url:competitor,
      scores:comp.scores,
      entities:comp.entities,
      schemaTypes:comp.schemaTypes
    }
  }

  return NextResponse.json({

    ...main,

    previewImage:`https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=1200`,

    competitor:compData

  })
}
