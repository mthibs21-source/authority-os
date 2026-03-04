import { NextResponse } from "next/server"

function extract(html: string, regex: RegExp) {
  const matches = html.match(regex)
  return matches ? matches.length : 0
}

function getInternalLinks(html: string, baseUrl: string) {

  const links = new Set<string>()

  const matches = html.match(/href="([^"#]+)"/gi)

  if (!matches) return []

  for (const m of matches) {

    const url = m.replace(/href="/i,"").replace(/"/,"")

    if (url.startsWith("/")) {
      links.add(baseUrl + url)
    }

    if (url.startsWith(baseUrl)) {
      links.add(url)
    }

  }

  return Array.from(links).slice(0,10)
}

async function analyzePage(url: string) {

  try {

    const res = await fetch(url,{
      headers:{
        "User-Agent":"AuthorityOSBot"
      }
    })

    const html = await res.text()

    return {
      title: extract(html, /<title>/gi),
      meta: extract(html, /meta name="description"/gi),
      h1: extract(html, /<h1/gi),
      h2: extract(html, /<h2/gi),
      schema: extract(html, /application\/ld\+json/gi),
      faq: extract(html, /faq/gi),
      html
    }

  } catch {

    return null

  }

}

export async function POST(req: Request) {

  try {

    const { url } = await req.json()

    if(!url){
      return NextResponse.json(
        { error:"Missing URL" },
        { status:400 }
      )
    }

    const base = new URL(url).origin

    const homepage = await analyzePage(url)

    if(!homepage){
      throw new Error("Could not fetch site")
    }

    const links = getInternalLinks(homepage.html,base)

    const pages = [homepage]

    for(const link of links){

      const data = await analyzePage(link)

      if(data) pages.push(data)

    }

    let authority = 40
    let aio = 40
    let geo = 40
    let aeo = 40

    let totalH2 = 0
    let totalSchema = 0
    let totalFaq = 0

    pages.forEach(p => {

      if(p.title) authority += 2
      if(p.meta) authority += 2
      if(p.h1) authority += 2

      totalH2 += p.h2
      totalSchema += p.schema
      totalFaq += p.faq

    })

    authority += Math.min(20,totalH2)

    aio += Math.min(20,totalSchema * 5)

    geo += Math.min(20,totalH2)

    aeo += Math.min(20,totalFaq * 5)

    authority = Math.min(100,authority)
    aio = Math.min(100,aio)
    geo = Math.min(100,geo)
    aeo = Math.min(100,aeo)

    const recommendations:string[] = []

    if(totalSchema === 0){
      recommendations.push("Add structured data schema markup")
    }

    if(totalH2 < 10){
      recommendations.push("Increase content depth with more sections")
    }

    if(totalFaq === 0){
      recommendations.push("Add FAQ sections for AI answer engines")
    }

    recommendations.push("Expand topical authority across related pages")
    recommendations.push("Improve internal linking between pages")

    return NextResponse.json({

      pagesScanned: pages.length,

      scores:{
        authority,
        aio,
        geo,
        aeo
      },

      recommendations

    })

  } catch(error){

    return NextResponse.json(
      { error:"Scan failed" },
      { status:500 }
    )

  }

}
