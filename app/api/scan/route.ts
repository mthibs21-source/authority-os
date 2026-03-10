import { NextResponse } from "next/server"
import * as cheerio from "cheerio"

async function fetchHTML(url:string){

  try{

    const res = await fetch(url,{
      headers:{
        "User-Agent":"Mozilla/5.0"
      }
    })

    return await res.text()

  }catch{

    return ""
  }
}

function extractLinks(html:string,domain:string){

  const $ = cheerio.load(html)

  const links = new Set<string>()

  $("a").each((_,el)=>{

    const href = $(el).attr("href")

    if(!href) return

    if(href.startsWith("/") && links.size < 10){

      links.add(domain + href)

    }

  })

  return Array.from(links)

}

function detectSchema($:any){

  const schemas:any[] = []

  $('script[type="application/ld+json"]').each((_,el)=>{

    try{

      const json = JSON.parse($(el).html() || "")

      if(json["@type"]) schemas.push(json["@type"])

    }catch{}

  })

  return schemas
}

function detectFAQ($:any){

  let faq = false

  $("h2,h3").each((_,el)=>{

    const text = $(el).text().toLowerCase()

    if(
      text.includes("faq") ||
      text.includes("frequently asked") ||
      text.includes("questions")
    ){
      faq = true
    }

  })

  return faq
}

function countInternalLinks($:any,domain:string){

  let count = 0

  $("a").each((_,el)=>{

    const href = $(el).attr("href")

    if(href && href.includes(domain)) count++

  })

  return count
}

export async function POST(req:Request){

  try{

    const { website, competitor } = await req.json()

    if(!website){

      return NextResponse.json({error:"missing website"})

    }

    const homepage = await fetchHTML(website)

    const links = extractLinks(homepage,website)

    const pages = [website,...links.slice(0,9)]

    let schemaCount = 0
    let faqCount = 0
    let linkCount = 0

    for(const page of pages){

      const html = await fetchHTML(page)

      if(!html) continue

      const $ = cheerio.load(html)

      const schema = detectSchema($)
      const faq = detectFAQ($)
      const links = countInternalLinks($,website)

      schemaCount += schema.length
      linkCount += links

      if(faq) faqCount++

    }

    const authority = Math.min(100,40 + schemaCount*5 + linkCount/5)
    const aio = schemaCount > 0 ? 70 : 40
    const geo = linkCount > 50 ? 80 : 40
    const aeo = faqCount > 0 ? 75 : 30

    const recommendations:any[] = []

    if(schemaCount === 0){

      recommendations.push({
        category:"AIO",
        title:"Add structured schema",
        reason:"AI systems rely heavily on schema markup",
        fix:"Add Organization and WebSite schema to your pages"
      })

    }

    if(faqCount === 0){

      recommendations.push({
        category:"AEO",
        title:"Add FAQ content",
        reason:"Answer engines extract structured questions",
        fix:"Add FAQ blocks and FAQ schema to key service pages"
      })

    }

    if(linkCount < 30){

      recommendations.push({
        category:"GEO",
        title:"Improve internal linking",
        reason:"Authority clusters help AI understand topics",
        fix:"Link related pages and service clusters together"
      })

    }

    return NextResponse.json({

      scores:{
        authority:Math.round(authority),
        aio:Math.round(aio),
        geo:Math.round(geo),
        aeo:Math.round(aeo)
      },

      pagesScanned:pages.length,

      recommendations

    })

  }catch(err){

    console.error(err)

    return NextResponse.json({error:"scan failed"})

  }

}
