import { NextResponse } from "next/server"
import * as cheerio from "cheerio"

async function analyzePage(url:string){

  try{

    const res = await fetch(url,{
      headers:{ "User-Agent":"AuthorityOSBot" }
    })

    const html = await res.text()

    const $ = cheerio.load(html)

    const title = $("title").text()
    const meta = $('meta[name="description"]').attr("content") || ""

    const h1 = $("h1").length
    const h2 = $("h2").length

    const wordCount = $("body").text().split(/\s+/).length

    const internalLinks = $("a[href^='/']").length

    const schemaTypes:string[] = []

    $('script[type="application/ld+json"]').each((_,el)=>{

      const content = $(el).html()

      if(!content) return

      if(content.includes("Organization")) schemaTypes.push("Organization")
      if(content.includes("Product")) schemaTypes.push("Product")
      if(content.includes("FAQPage")) schemaTypes.push("FAQ")
      if(content.includes("Article")) schemaTypes.push("Article")

    })

    const faqDetected = html.toLowerCase().includes("faq")

    const entityWords = [
      "about us",
      "our mission",
      "company",
      "founder",
      "team"
    ]

    let entityScore = 0

    entityWords.forEach(w=>{
      if(html.toLowerCase().includes(w)){
        entityScore += 10
      }
    })

    return{
      title,
      meta,
      h1,
      h2,
      wordCount,
      schemaTypes,
      internalLinks,
      faqDetected,
      entityScore
    }

  }catch{

    return null

  }

}

function score(data:any){

  let authority = 50
  let aio = 40
  let geo = 40
  let aeo = 40
  let citation = 40

  if(data.title.length > 10) authority += 10
  if(data.meta.length > 50) authority += 10

  if(data.h1 === 1) authority += 10

  if(data.wordCount > 800) authority += 10

  if(data.internalLinks > 10) authority += 10

  if(data.schemaTypes.length){

    aio += 20
    citation += 10

  }

  if(data.schemaTypes.includes("FAQ")){

    aeo += 25
    citation += 25

  }

  geo += data.entityScore

  citation += data.entityScore / 2

  return{
    authority:Math.min(100,authority),
    aio:Math.min(100,aio),
    geo:Math.min(100,geo),
    aeo:Math.min(100,aeo),
    citation:Math.min(100,citation),
    entity:data.entityScore
  }

}

function fixEngine(data:any){

  const fixes:any[] = []

  if(!data.schemaTypes.length){

    fixes.push({
      task:"Add Organization schema",
      impact:8
    })

  }

  if(!data.schemaTypes.includes("FAQ")){

    fixes.push({
      task:"Add FAQ schema to increase AI citations",
      impact:18
    })

  }

  if(data.wordCount < 800){

    fixes.push({
      task:`Increase content depth to ~900 words`,
      impact:12
    })

  }

  if(data.internalLinks < 10){

    fixes.push({
      task:"Add internal links between service pages",
      impact:10
    })

  }

  if(data.h1 !== 1){

    fixes.push({
      task:"Ensure exactly one H1 tag",
      impact:6
    })

  }

  return fixes.sort((a,b)=>b.impact-a.impact)

}

async function analyzeSite(url:string){

  const data = await analyzePage(url)

  if(!data) return null

  const scores = score(data)

  const fixes = fixEngine(data)

  return{
    scores,
    schemaTypes:data.schemaTypes,
    pagesScanned:1,
    executionPlan:fixes
  }

}

export async function POST(req:Request){

  const body = await req.json()

  const url = body.url
  const competitor = body.competitor

  const main = await analyzeSite(url)

  if(!main){

    return NextResponse.json({ error:"Scan failed" })

  }

  let competitorData = null

  if(competitor){

    const comp = await analyzeSite(competitor)

    if(comp){

      competitorData={
        url:competitor,
        scores:comp.scores
      }

    }

  }

  return NextResponse.json({

    scores:main.scores,
    schemaTypes:main.schemaTypes,
    pagesScanned:main.pagesScanned,
    competitor:competitorData,
    executionPlan:main.executionPlan

  })

}
