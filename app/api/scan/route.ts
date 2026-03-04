import { NextResponse } from "next/server"

async function analyzeSite(url:string){

  try{

    const res = await fetch(url)

    const html = await res.text()

    const schemaTypes:string[] = []

    if(html.includes('"@type":"Organization"')) schemaTypes.push("Organization")
    if(html.includes('"@type":"Product"')) schemaTypes.push("Product")
    if(html.includes('"@type":"FAQPage"')) schemaTypes.push("FAQ")
    if(html.includes('"@type":"Article"')) schemaTypes.push("Article")

    const scores = {
      authority: Math.floor(Math.random()*40)+60,
      aio: Math.floor(Math.random()*40)+40,
      geo: Math.floor(Math.random()*40)+40,
      aeo: Math.floor(Math.random()*40)+30,
      citation: Math.floor(Math.random()*40)+40,
      entity: Math.floor(Math.random()*40)+40
    }

    return {
      url,
      scores,
      schemaTypes,
      pagesScanned: Math.floor(Math.random()*10)+5
    }

  }catch{

    return null

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

    recommendations:[
      "Add structured schema markup",
      "Improve topical authority with more content clusters",
      "Increase internal linking between high authority pages",
      "Add FAQ schema to increase AI citation likelihood"
    ]

  })

}
