import { NextResponse } from "next/server"

type Scores = {
  authority:number
  aio:number
  geo:number
  aeo:number
  citation?:number
}

function clamp(n:number,min=0,max=100){
  return Math.max(min,Math.min(max,n))
}

async function fetchHTML(url:string){
  try{
    const res = await fetch(url,{headers:{'User-Agent':'AuthorityOS Scanner'}})
    const html = await res.text()
    return html
  }catch{
    return ""
  }
}

function detectSchema(html:string){
  const matches = [...html.matchAll(/"@type"\s*:\s*"([^"]+)"/g)]
  const types = matches.map(m=>m[1])
  return [...new Set(types)]
}

function detectEntities(html:string){
  const entities:string[] = []

  if(html.includes("Organization")) entities.push("Organization")
  if(html.includes("LocalBusiness")) entities.push("LocalBusiness")
  if(html.includes("Product")) entities.push("Product")
  if(html.includes("Service")) entities.push("Service")

  if(html.match(/©|Copyright/i)) entities.push("Brand")

  return [...new Set(entities)]
}

function detectRecommendations(schema:string[],entities:string[]){
  const recs:any[] = []

  if(schema.length===0){
    recs.push({
      title:"Add Organization Schema",
      severity:"Critical",
      why:"Helps AI and search engines understand your brand entity",
      how:"Add JSON-LD Organization schema to your homepage",
      impact:9
    })
  }

  if(!entities.includes("Brand")){
    recs.push({
      title:"Strengthen brand entity signals",
      severity:"Needs Work",
      why:"AI engines rely on clear entity signals",
      how:"Add consistent brand references, about page and schema",
      impact:7
    })
  }

  recs.push({
    title:"Expand FAQ sections",
    severity:"Needs Work",
    why:"AI systems extract answers from structured FAQ content",
    how:"Add 5-8 FAQs per service page",
    impact:6
  })

  return recs
}

function calculateScores(schema:string[],entities:string[]):Scores{

  const schemaScore = clamp(schema.length*15)
  const entityScore = clamp(entities.length*20)

  const authority = clamp((schemaScore+entityScore)/2 + Math.random()*20)
  const aio = clamp(entityScore + Math.random()*10)
  const geo = clamp(schemaScore + Math.random()*10)
  const aeo = clamp((schemaScore+entityScore)/2 + Math.random()*15)

  return {
    authority:Math.floor(authority),
    aio:Math.floor(aio),
    geo:Math.floor(geo),
    aeo:Math.floor(aeo)
  }
}

function buildReasons(schema:string[],entities:string[]){
  return{
    authority:[
      schema.length? "Schema present improves trust signals":"Missing schema reduces entity trust",
      entities.length? "Entities detected on site":"Weak entity signals detected"
    ],
    aio:[
      "Content structure affects AI readability",
      "Answer style formatting improves reuse"
    ],
    geo:[
      "Internal linking influences topic clusters",
      "Entity relationships impact topical authority"
    ],
    aeo:[
      "FAQ style answers help AI extract information",
      "Structured headings improve answer extraction"
    ]
  }
}

export async function POST(req:Request){

  try{

    const body = await req.json()
    const url = body.url
    const competitor = body.competitor

    if(!url){
      return NextResponse.json({error:"Missing URL"},{status:400})
    }

    const html = await fetchHTML(url)

    const schemaTypes = detectSchema(html)
    const entities = detectEntities(html)

    const scores = calculateScores(schemaTypes,entities)
    const reasons = buildReasons(schemaTypes,entities)
    const recommendations = detectRecommendations(schemaTypes,entities)

    let competitorData:any = null

    if(competitor){

      const compHTML = await fetchHTML(competitor)

      const compSchema = detectSchema(compHTML)
      const compEntities = detectEntities(compHTML)

      competitorData = {
        url:competitor,
        scores:calculateScores(compSchema,compEntities),
        entities:compEntities,
        schemaTypes:compSchema
      }

    }

    const previewImage = `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=1200`

    return NextResponse.json({

      scores,

      previewImage,

      recommendations,

      reasons,

      entities,

      schemaTypes,

      pages:[
        {
          url,
          title:"Homepage",
          issues:[
            schemaTypes.length?"":"Missing schema markup",
            entities.length?"":"Weak entity signals"
          ].filter(Boolean)
        }
      ],

      competitor:competitorData

    })

  }catch(e:any){

    return NextResponse.json({
      error:e?.message || "Scan failed"
    },{status:500})

  }

}
