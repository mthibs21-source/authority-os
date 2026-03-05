import { NextResponse } from "next/server"
import * as cheerio from "cheerio"

function normalize(url:string){
if(!url.startsWith("http")) return "https://" + url
return url
}

function extractTopic(text:string){

const words = text
.toLowerCase()
.replace(/[^a-z ]/g,"")
.split(" ")
.filter(w => w.length > 4)

const counts:Record<string,number> = {}

words.forEach(w=>{
counts[w] = (counts[w] || 0) + 1
})

const sorted =
Object.entries(counts)
.sort((a,b)=>b[1]-a[1])

return sorted.slice(0,5).map(x=>x[0])
}

function scorePage(html:string,text:string){

const wordCount = text.split(" ").length

const headings =
(html.match(/<h1/g)||[]).length +
(html.match(/<h2/g)||[]).length

const schema =
html.includes("application/ld+json")

let score = 0

score += Math.min(wordCount/50,40)
score += headings * 5

if(schema) score += 15

return Math.min(100,Math.round(score))
}

async function crawl(url:string,limit:number){

const visited = new Set<string>()
const queue = [url]
const pages:any[] = []

while(queue.length && pages.length < limit){

const current = queue.shift()

if(!current || visited.has(current)) continue

visited.add(current)

try{

const res = await fetch(current,{
headers:{
"User-Agent":"Mozilla/5.0"
}
})

const html = await res.text()

const $ = cheerio.load(html)

const text = $("body").text()

const topics = extractTopic(text)

pages.push({
url:current,
score:scorePage(html,text),
topics
})

$("a").each((_,el)=>{

const href = $(el).attr("href")

if(!href) return

if(href.startsWith("/")){
queue.push(new URL(href,url).href)
}

})

}catch(err){

pages.push({
url:current,
score:0,
topics:[],
error:true
})

}

}

return pages
}

function buildTopicMap(pages:any[]){

const map:Record<string,number> = {}

pages.forEach(p=>{

p.topics.forEach((t:string)=>{
map[t] = (map[t]||0)+1
})

})

return Object.entries(map)
.sort((a,b)=>b[1]-a[1])
.slice(0,10)
}

function buildContentIdeas(topicMap:any[]){

const ideas:string[] = []

topicMap.forEach(([topic])=>{

ideas.push(`Complete guide to ${topic}`)
ideas.push(`${topic} best practices`)
ideas.push(`${topic} for beginners`)

})

return ideas.slice(0,10)
}

export async function POST(req:Request){

try{

const body = await req.json()

const url = normalize(body.url)

const competitor = body.competitor

const pages = await crawl(url,10)

const avg =
pages.reduce((a,b)=>a+b.score,0) /
(pages.length || 1)

const scores = {
authority:Math.round(avg),
aio:Math.round(avg*0.65),
geo:Math.round(avg*0.6),
aeo:Math.round(avg*0.45),
citation:Math.round(avg*0.55),
entity:Math.round(avg*0.5)
}

const topicMap = buildTopicMap(pages)

const opportunities =
buildContentIdeas(topicMap)

return NextResponse.json({

success:true,
scores,
pages,
pagesScanned:pages.length,
topicMap,
opportunities,

recommendations:[
"Add FAQ schema",
"Increase entity mentions",
"Strengthen internal linking",
"Add long form topic clusters"
],

competitor: competitor
? {
url:competitor,
scores:{
authority:70,
aio:65,
geo:60,
aeo:55
}
}
: null

})

}catch(err){

return NextResponse.json({
success:false,
error:"Scan failed"
})

}

}
