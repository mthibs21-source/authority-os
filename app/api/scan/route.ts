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

const { website } = await req.json()

const html = await fetchHTML(website)

const $ = cheerio.load(html)

const schemaCount = $('script[type="application/ld+json"]').length
const faq = $("h2:contains('FAQ'),h3:contains('FAQ')").length > 0

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
reason:"Answer engines extract structured Q&A blocks",
fix:"Add FAQ sections and FAQ schema"
},

{
category:"AIO",
title:"Add Organization schema",
reason:"AI engines rely on entity markup to understand brands",
fix:"Add JSON-LD Organization schema"
},

{
category:"GEO",
title:"Improve internal linking",
reason:"Topic clusters strengthen AI authority mapping",
fix:"Link service pages together"
},

{
category:"SEO",
title:"Improve heading structure",
reason:"AI extracts answers from headings and short paragraphs",
fix:"Add H2 question headings"
},

{
category:"Authority",
title:"Increase topical coverage",
reason:"AI prefers sites with strong topic clusters",
fix:"Publish related articles supporting core services"
},

{
category:"AEO",
title:"Add question-based content",
reason:"LLMs extract answers from conversational content",
fix:"Add sections answering common questions"
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

}
