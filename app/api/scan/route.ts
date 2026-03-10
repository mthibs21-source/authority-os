import { NextResponse } from "next/server"
import * as cheerio from "cheerio"

async function fetchHTML(url:string){

try{

const res = await fetch(url,{
headers:{ "User-Agent":"Mozilla/5.0" }
})

return await res.text()

}catch{

return ""
}

}

export async function POST(req:Request){

try{

const { website } = await req.json()

const html = await fetchHTML(website)

const $ = cheerio.load(html)

let schemaCount = $('script[type="application/ld+json"]').length

let faq = $("h2:contains('FAQ'),h3:contains('FAQ')").length > 0

let internalLinks = 0

$("a").each((_,el)=>{

const href = $(el).attr("href")

if(href && href.includes(website)) internalLinks++

})

const authority = Math.min(100,40 + schemaCount*10 + internalLinks/5)
const aio = schemaCount > 0 ? 70 : 40
const geo = internalLinks > 30 ? 75 : 40
const aeo = faq ? 70 : 30

const recommendations = [

{
category:"AEO",
title:"Add FAQ content",
reason:"Answer engines extract structured Q&A sections",
fix:"Add FAQ sections and FAQ schema markup"
},

{
category:"AIO",
title:"Add organization schema",
reason:"AI engines rely on structured entity data",
fix:"Add Organization schema to your homepage"
},

{
category:"GEO",
title:"Improve internal linking",
reason:"AI authority is built through topic clusters",
fix:"Link related pages and services together"
},

{
category:"SEO",
title:"Add H2 answer headings",
reason:"AI extracts answers from well structured headings",
fix:"Add direct question headings for key topics"
},

{
category:"SEO",
title:"Increase content depth",
reason:"AI citations prefer authoritative long form pages",
fix:"Expand service pages with 800+ words"
},

{
category:"Authority",
title:"Create topical clusters",
reason:"Authority comes from topic coverage",
fix:"Create supporting blog content around core services"
}

]

return NextResponse.json({

scores:{
authority:Math.round(authority),
aio:Math.round(aio),
geo:Math.round(geo),
aeo:Math.round(aeo)
},

recommendations

})

}catch{

return NextResponse.json({error:"Scan failed"})

}

}
