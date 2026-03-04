import { NextResponse } from "next/server"
import * as cheerio from "cheerio"

async function crawlPage(url:string){

  try{

    const res = await fetch(url,{
      headers:{
        "User-Agent":"AuthorityOSBot"
      }
    })

    const html = await res.text()

    const $ = cheerio.load(html)

    const title = $("title").text()

    const metaDescription = $('meta[name="description"]').attr("content") || ""

    const h1Count = $("h1").length
    const h2Count = $("h2").length

    const wordCount = $("body").text().split(/\s+/).length

    const schemaTypes:string[] = []

    $('script[type="application/ld+json"]').each((_,el)=>{

      const text = $(el).html()

      if(!text) return

      if(text.includes("Organization")) schemaTypes.push("Organization")
      if(text.includes("Product")) schemaTypes.push("Product")
      if(text.includes("FAQPage")) schemaTypes.push("FAQ")
      if(text.includes("Article")) schemaTypes.push("Article")

    })

    const internalLinks = $("a[href^='/']").length

    const faqDetected = html.toLowerCase().includes("faq")

    const entitySignals = [
      "about us",
      "company",
      "founder",
      "brand",
      "our mission"
    ]

    let entityScore = 0

    entitySignals.forEach(s=>{
      if(html.toLowerCase().includes(s)){
        entityScore += 10
      }
    })

    return {

      title,
      metaDescription,
      h1Count,
      h2Count,
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

function calculateScores(data:any){

  let authority = 40
  let aio = 40
  let geo = 40
  let aeo = 40
  let citation = 40

  if(data.title.length > 10) authority += 10

  if(data.metaDescription.length > 50) authority += 10

  if(data.h1Count === 1) authority += 10

  if(data.h2Count > 2) authority += 5

  if(data.wordCount > 600) authority += 10

  if(data.schemaTypes.length > 0){

    aio += 15
    citation += 10

  }

  if(data.schemaTypes.includes("FAQ")){

    aeo += 20
    citation += 20

  }

  if(data.internalLinks > 5){

    authority += 10

  }

  geo += data.entityScore

  citation += data.entityScore / 2

  return {

    authority: Math.min(100,authority),
    aio: Math.min(100,aio),
    geo: Math.min(100,geo),
    aeo: Math.min(100,aeo),
    citation: Math.min(100,citation),
    entity: Math.min(100,data.entityScore)

  }

}

async function analyzeSite(url:string){

  const page = await crawlPage(url)

  if(!page) return null

  const scores = calculateScores(page)

  const recommendations:string[] = []

  if(page.schemaTypes.length === 0){

    recommendations.push("Add structured schema markup to help AI engines understand your content")

  }

  if(page.wordCount < 600){

    recommendations.push("Increase page content depth to improve topical authority")

  }

  if(page.h1Count !== 1){

    recommendations.push("Use exactly one H1 tag for better structure")

  }

  if(!page.faqDetected){

    recommendations.push("Add FAQ content to increase AI citation likelihood")

  }

  if(page.internalLinks < 5){

    recommendations.push("Increase internal linking between pages")

  }

  return {

    scores,
    schemaTypes:page.schemaTypes,
    pagesScanned:1,
    recommendations

  }

}

export async function POST(req:Request){

  const body = await req.json()

  const url = body.url
  const competitor = body.competitor

  const main = await analyzeSite(url)

  if(!main){

    return NextResponse.json({
      error:"Scan failed"
    })

  }

  let competitorData = null

  if(competitor){

    const comp = await analyzeSite(competitor)

    if(comp){

      competitorData = {

        url:competitor,
        scores:comp.scores,
        pagesScanned:comp.pagesScanned

      }

    }

  }

  return NextResponse.json({

    scores:main.scores,
    schemaTypes:main.schemaTypes,
    pagesScanned:main.pagesScanned,
    competitor:competitorData,
    recommendations:main.recommendations

  })

}
