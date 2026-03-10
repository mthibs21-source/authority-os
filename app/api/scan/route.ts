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

function detectSchema($:any){

  let count = 0

  $('script[type="application/ld+json"]').each(()=>{

    count++

  })

  return count

}

function detectFAQ($:any){

  let faq = false

  $("h2,h3").each((_:any,el:any)=>{

    const text = $(el).text().toLowerCase()

    if(text.includes("faq") || text.includes("questions")){
      faq = true
    }

  })

  return faq

}

function countInternalLinks($:any,domain:string){

  let count = 0

  $("a").each((_:any,el:any)=>{

    const href = $(el).attr("href")

    if(href && href.includes(domain)){
      count++
    }

  })

  return count

}

export async function POST(req:Request){

  try{

    const { website } = await req.json()

    const html = await fetchHTML(website)

    if(!html){

      return NextResponse.json({
        error:"Unable to fetch site"
      })

    }

    const $ = cheerio.load(html)

    const schemaCount = detectSchema($)
    const faq = detectFAQ($)
    const internalLinks = countInternalLinks($,website)

    const authority = Math.min(100,40 + schemaCount*10 + internalLinks/5)
    const aio = schemaCount > 0 ? 70 : 40
    const geo = internalLinks > 30 ? 75 : 40
    const aeo = faq ? 70 : 30

    const recommendations:any[] = []

    if(schemaCount === 0){

      recommendations.push({
        title:"Add structured schema",
        reason:"AI engines rely heavily on schema markup",
        fix:"Add Organization and WebSite schema to your pages"
      })

    }

    if(!faq){

      recommendations.push({
        title:"Add FAQ content",
        reason:"Answer engines extract structured Q&A content",
        fix:"Add FAQ sections and FAQ schema"
      })

    }

    if(internalLinks < 20){

      recommendations.push({
        title:"Improve internal linking",
        reason:"Topic clusters help AI understand authority",
        fix:"Link related pages and create content clusters"
      })

    }

    return NextResponse.json({

      scores:{
        authority:Math.round(authority),
        aio:Math.round(aio),
        geo:Math.round(geo),
        aeo:Math.round(aeo)
      },

      recommendations

    })

  }catch(err){

    console.error(err)

    return NextResponse.json({
      error:"Scan failed"
    })

  }

}
