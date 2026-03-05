import { NextResponse } from "next/server"
import * as cheerio from "cheerio"

function clamp(n:number,min=0,max=100){
  return Math.max(min,Math.min(max,n))
}

function roundScore(n:number){
  return Math.round(clamp(n))
}

async function fetchHTML(url:string){
  try{
    const res = await fetch(url,{
      headers:{
        "User-Agent":"Mozilla/5.0 AuthorityOS"
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
  if(text.match(/service/i)) entities.push("Service")

  if($("footer").text().match(/©|copyright/i)){
    entities.push("Brand")
  }

  return [...new Set(entities)]

}

function scoreAIO($:cheerio.CheerioAPI){

  const headings = $("h1,h2,h3").length
  const paragraphs = $("p").length

  return roundScore((headings + paragraphs/10) * 2)

}

function scoreAEO($:cheerio.CheerioAPI){

  const faq = $('[itemtype*="FAQPage"]').length
  const questions = $("h2:contains('?'),h3:contains('?')").length

  return roundScore(faq*40 + questions*2)

}

function scoreGEO($:cheerio.CheerioAPI){

  const links = $("a[href]").length
  const internal = $("a[href^='/']").length

  if(links===0) return 0

  return roundScore((internal/links)*100)

}

function scoreAuthority(schema:string[],entities:string[]){

  return roundScore(schema.length*15 + entities.length*20)

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

  return{

    scores:{
      authority,
      aio,
      geo,
      aeo
    },

    entities,

    schemaTypes,

    pages:[
      {
        url,
        title:$("title").text(),
        issues:[
          schemaTypes.length?null:"Missing schema markup",
          entities.length?null:"Weak entity signals"
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

function buildPreview(url:string){

  const encoded = encodeURIComponent(url)

  return `https://s.wordpress.com/mshots/v1/${encoded}?w=1200`

}

export async function POST(req:Request){

  const {url,competitor} = await req.json()

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

    previewImage:buildPreview(url),

    competitor:compData

  })

}
