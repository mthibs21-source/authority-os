"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function scoreColor(score:number){

  if(score >= 70) return "text-green-400 border-green-500"

  if(score >= 40) return "text-orange-400 border-orange-400"

  return "text-red-400 border-red-500"

}

function normalizeUrl(url:string){

  let u = url.trim()

  if(!u.startsWith("http")){
    u = "https://" + u
  }

  return u

}

export default function AuthorityOS(){

  const [url,setUrl] = useState("")
  const [competitor,setCompetitor] = useState("")
  const [depth,setDepth] = useState(10)

  const [loading,setLoading] = useState(false)
  const [error,setError] = useState("")

  const [data,setData] = useState<any>(null)

  const runScan = async()=>{

    if(!url) return

    setLoading(true)
    setError("")
    setData(null)

    const normalizedUrl = normalizeUrl(url)

    try{

      const res = await fetch("/api/scan",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          url:normalizedUrl,
          competitor,
          depth
        })
      })

      const result = await res.json()

      if(!result?.scores){
        throw new Error()
      }

      setData(result)

    }catch{

      setError("Scan failed")

    }

    setLoading(false)

  }

  return(

    <main className="min-h-screen bg-[#070d18] text-white">

      {/* HERO */}

      <section className="max-w-6xl mx-auto px-6 pt-28 pb-20 grid lg:grid-cols-2 gap-16 items-center">

        <div>

          <h1 className="text-6xl font-extrabold">

            Become the <span className="text-[#eaff00]">Authority</span> AI Cites

          </h1>

          <p className="mt-6 text-slate-300 text-lg">

            AuthorityOS analyzes whether your website is trusted by AI search
            engines like ChatGPT, Perplexity, and Gemini.

          </p>

        </div>

        <img
          src="https://images.unsplash.com/photo-1639322537228-f710d846310a"
          className="rounded-2xl border border-[#eaff00]/40 shadow-[0_0_60px_rgba(234,255,0,0.25)] brightness-110"
        />

      </section>

      {/* SCANNER */}

      <section className="max-w-6xl mx-auto px-6 py-20">

        <Card className="bg-[#111a2b] border border-[#eaff00]/30">

          <CardContent className="p-10 space-y-6">

            <h2 className="text-3xl font-bold text-[#eaff00]">
              Run Authority Scan
            </h2>

            <div className="grid md:grid-cols-3 gap-4">

              <Input
                placeholder="Your Website"
                value={url}
                onChange={(e)=>setUrl(e.target.value)}
                className="bg-[#070d18] border-[#eaff00]/40 text-white placeholder:text-slate-400"
              />

              <Input
                placeholder="Competitor Website"
                value={competitor}
                onChange={(e)=>setCompetitor(e.target.value)}
                className="bg-[#070d18] border-[#eaff00]/40 text-white placeholder:text-slate-400"
              />

              <select
                value={depth}
                onChange={(e)=>setDepth(Number(e.target.value))}
                className="bg-[#070d18] border border-[#eaff00]/40 text-white px-3 py-2 rounded"
              >

                <option value={3}>Light Scan (3 pages)</option>
                <option value={10}>Standard Scan (10 pages)</option>
                <option value={25}>Deep Scan (25 pages)</option>

              </select>

            </div>

            <Button
              onClick={runScan}
              className="bg-[#eaff00] text-black font-bold px-8 hover:bg-[#d7f000] hover:shadow-[0_0_25px_rgba(234,255,0,0.6)] transition"
            >

              {loading ? "Scanning..." : "Scan"}

            </Button>

            {url && (

              <img
                src={`https://image.thum.io/get/width/1200/${url}`}
                className="rounded-xl border border-[#eaff00]/30"
              />

            )}

            {error && (

              <div className="text-red-400">
                {error}
              </div>

            )}

          </CardContent>

        </Card>

      </section>

      {/* RESULTS */}

      {data && (

        <section className="max-w-6xl mx-auto px-6 pb-40 space-y-12">

          <h2 className="text-3xl font-bold text-[#eaff00]">
            Results
          </h2>

          <div className="grid md:grid-cols-5 gap-6">

            {Object.entries(data.scores).map(([k,v]:any)=>(
              <Card key={k} className="bg-[#111a2b] border border-[#eaff00]/20">

                <CardContent className="p-8 text-center">

                  <div className={`text-3xl font-bold ${scoreColor(v)}`}>
                    {v}
                  </div>

                  <div className="text-slate-400">
                    {k}
                  </div>

                </CardContent>

              </Card>
            ))}

          </div>

          {data.pagesScanned && (

            <div className="text-slate-400">
              Pages scanned: {data.pagesScanned}
            </div>

          )}

          {data.schemaTypes && (

            <Card className="bg-[#111a2b] border border-[#eaff00]/20">

              <CardContent className="p-6">

                <div className="font-bold text-white">
                  Detected Schema
                </div>

                <div className="text-slate-400">
                  {data.schemaTypes.join(", ")}
                </div>

              </CardContent>

            </Card>

          )}

          {data.recommendations && (

            <div className="space-y-4">

              <h3 className="text-xl font-bold">
                Recommendations
              </h3>

              {data.recommendations.map((r:string)=>(
                <Card key={r} className="bg-[#111a2b] border border-[#eaff00]/20">

                  <CardContent className="p-6">
                    {r}
                  </CardContent>

                </Card>
              ))}

            </div>

          )}

        </section>

      )}

      <footer className="border-t border-white/10 py-10 text-center text-slate-400">

        Built by Uplift Digital

      </footer>

    </main>

  )

}
