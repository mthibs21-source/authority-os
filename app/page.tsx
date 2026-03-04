"use client"

import React, { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

/* ---------------- HELPERS ---------------- */

function normalizeUrl(url:string){

  let u = url.trim()

  if(!u.startsWith("http")){
    u = "https://" + u
  }

  return u
}

function scoreColor(score:number){

  if(score >= 75) return "text-green-400"

  if(score >= 45) return "text-orange-400"

  return "text-red-400"

}

function screenshotUrl(url:string){

  if(!url) return ""

  return `https://image.thum.io/get/width/1400/${normalizeUrl(url)}`

}

/* ---------------- TYPES ---------------- */

type Scores = {
  authority:number
  aio:number
  geo:number
  aeo:number
  citation?:number
  entity?:number
}

type ScanResponse = {
  scores:Scores
  schemaTypes?:string[]
  recommendations?:string[]
  pagesScanned?:number
  competitor?:{
    url:string
    scores:Scores
  }
}

/* ---------------- MAIN PAGE ---------------- */

export default function AuthorityOS(){

  const [url,setUrl] = useState("")
  const [competitor,setCompetitor] = useState("")
  const [depth,setDepth] = useState(10)

  const [loading,setLoading] = useState(false)
  const [data,setData] = useState<ScanResponse|null>(null)
  const [error,setError] = useState<string|null>(null)

  const siteShot = useMemo(()=>screenshotUrl(url),[url])

  async function runScan(){

    const normalized = normalizeUrl(url)

    if(!normalized) return

    setLoading(true)
    setError(null)
    setData(null)

    try{

      const res = await fetch("/api/scan",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({
          url:normalized,
          competitor,
          depth
        })
      })

      const json = await res.json()

      if(!json.scores){
        throw new Error("Scan failed")
      }

      setData(json)

    }catch{

      setError("Scan failed")

    }

    setLoading(false)

  }

  return(

  <div className="min-h-screen bg-[#070d18] text-white">

  {/* HEADER */}

  <div className="max-w-6xl mx-auto px-6 pt-8 flex justify-between items-center">

  <h1 className="text-2xl font-bold text-[#eaff00]">
  AuthorityOS
  </h1>

  <div className="text-sm text-slate-400">
  Built by Uplift Digital
  </div>

  </div>


  {/* HERO */}

  <section className="max-w-6xl mx-auto px-6 pt-16 pb-12 grid lg:grid-cols-2 gap-10">

  <div>

  <h2 className="text-5xl font-bold leading-tight">

  Make your website the one AI engines  
  <span className="text-[#eaff00]"> trust and cite</span>

  </h2>

  <p className="mt-6 text-slate-300 text-lg">

  AuthorityOS scans your site and identifies SEO signals,
  schema markup, entity signals and AI citation likelihood.

  </p>

  </div>

  <img
  src="https://images.unsplash.com/photo-1639322537228-f710d846310a"
  className="rounded-xl border border-[#eaff00]/30"
  />

  </section>


  {/* SCANNER */}

  <section className="max-w-6xl mx-auto px-6 pb-16">

  <Card className="bg-[#111a2b] border border-[#eaff00]/30">

  <CardContent className="p-8 space-y-6">

  <h3 className="text-2xl font-bold text-[#eaff00]">

  Scan a Website

  </h3>

  <div className="grid lg:grid-cols-3 gap-4">

  <Input
  placeholder="Your website"
  value={url}
  onChange={(e)=>setUrl(e.target.value)}
  className="bg-[#070d18] border-[#eaff00]/30 text-white"
  />

  <Input
  placeholder="Competitor URL"
  value={competitor}
  onChange={(e)=>setCompetitor(e.target.value)}
  className="bg-[#070d18] border-[#eaff00]/30 text-white"
  />

  <select
  value={depth}
  onChange={(e)=>setDepth(Number(e.target.value))}
  className="bg-[#070d18] border border-[#eaff00]/30 px-3 py-2 rounded">

  <option value={3}>Light scan</option>
  <option value={10}>Standard scan</option>
  <option value={25}>Deep scan</option>

  </select>

  </div>

  <Button
  onClick={runScan}
  className="bg-[#eaff00] text-black font-bold hover:bg-[#d7f000]"
  >

  {loading ? "Scanning..." : "Run Scan"}

  </Button>

  {siteShot &&

  <img
  src={siteShot}
  className="rounded-lg border border-[#eaff00]/20"
  />

  }

  {error &&

  <div className="text-red-400">
  {error}
  </div>

  }

  </CardContent>

  </Card>

  </section>


  {/* RESULTS */}

  {data &&

  <section className="max-w-6xl mx-auto px-6 pb-32 space-y-10">

  <h3 className="text-3xl font-bold text-[#eaff00]">

  Scan Results

  </h3>


  {/* SCORES */}

  <div className="grid md:grid-cols-4 gap-6">

  {Object.entries(data.scores).map(([key,value]:any)=>(

  <Card key={key} className="bg-[#111a2b] border border-white/10">

  <CardContent className="p-6">

  <div className="text-slate-400 text-sm mb-2">

  {key.toUpperCase()}

  </div>

  <div className={`text-4xl font-bold ${scoreColor(value)}`}>

  {value}

  </div>

  </CardContent>

  </Card>

  ))}

  </div>


  {/* SCHEMA */}

  <Card className="bg-[#111a2b] border border-white/10">

  <CardContent className="p-6">

  <div className="text-lg font-bold mb-3">

  Schema detected

  </div>

  {data.schemaTypes?.length ?

  <div className="flex flex-wrap gap-2">

  {data.schemaTypes.map((s)=>(
  <span key={s} className="px-3 py-1 rounded bg-[#eaff00]/10 border border-[#eaff00]/30 text-[#eaff00] text-sm">
  {s}
  </span>
  ))}

  </div>

  :

  <div className="text-slate-400">
  No schema types detected
  </div>

  }

  </CardContent>

  </Card>


  {/* COMPETITOR */}

  <Card className="bg-[#111a2b] border border-white/10">

  <CardContent className="p-6">

  <div className="text-lg font-bold mb-2">

  Competitor comparison

  </div>

  {data.competitor ?

  <div className="text-slate-300">

  Comparing against: {data.competitor.url}

  </div>

  :

  <div className="text-slate-400">

  Add a competitor URL to compare scores side by side.

  </div>

  }

  </CardContent>

  </Card>


  {/* RECOMMENDATIONS */}

  <Card className="bg-[#111a2b] border border-white/10">

  <CardContent className="p-6">

  <div className="text-lg font-bold mb-4">

  Recommendations

  </div>

  <ul className="space-y-3">

  {data.recommendations?.map((r,i)=>(
  <li key={i} className="text-slate-200">
  {r}
  </li>
  ))}

  </ul>

  </CardContent>

  </Card>

  </section>

  }


  {/* FOOTER */}

  <div className="fixed bottom-4 right-4 text-xs text-slate-400">

  Built by Uplift Digital

  </div>


  </div>

  )

}
