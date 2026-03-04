"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

/* ---------------- PAGE ---------------- */

export default function AuthorityOS() {

  const [url,setUrl] = useState("")
  const [loading,setLoading] = useState(false)
  const [scores,setScores] = useState<any>(null)
  const [recommendations,setRecommendations] = useState<string[]>([])
  const [error,setError] = useState("")

  const runScan = async () => {

    if(!url) return

    setLoading(true)
    setError("")

    let normalizedUrl = url.trim()

    if(!normalizedUrl.startsWith("http")){
      normalizedUrl = "https://" + normalizedUrl
    }

    try{

      const res = await fetch("/api/scan",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ url: normalizedUrl })
      })

      const data = await res.json()

      if(!data?.scores) throw new Error()

      setScores(data.scores)
      setRecommendations(data.recommendations || [])

    }catch{
      setError("Scan failed")
    }

    setLoading(false)
  }

  return (

    <main>

      <Hero />

      <HowItWorks />

      <Features />

      <UseCases />

      <Scanner
        url={url}
        setUrl={setUrl}
        runScan={runScan}
        loading={loading}
        error={error}
      />

      {scores && (
        <Results
          scores={scores}
          recommendations={recommendations}
        />
      )}

    </main>

  )
}

/* ---------------- HERO ---------------- */

function Hero(){

  return(

    <section className="max-w-6xl mx-auto px-6 pt-28 pb-24 grid lg:grid-cols-2 gap-16 items-center">

      <div>

        <h1 className="text-6xl font-extrabold leading-tight">

          Become the <span className="text-[#eaff00]">Authority</span> AI Engines Cite

        </h1>

        <p className="mt-6 text-slate-300 text-lg max-w-xl">

          AuthorityOS analyzes whether your website is trusted by AI search
          engines like ChatGPT, Perplexity, and Gemini.

        </p>

      </div>

      <img
        src="https://images.unsplash.com/photo-1639322537228-f710d846310a"
        className="rounded-2xl border border-[#eaff00]/40 shadow-[0_0_60px_rgba(234,255,0,0.25)] brightness-110 contrast-110"
      />

    </section>

  )
}

/* ---------------- HOW IT WORKS ---------------- */

function HowItWorks(){

  return(

    <section className="max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">

      <div>

        <h2 className="text-4xl font-bold text-[#eaff00]">

          How AuthorityOS Works

        </h2>

        <p className="mt-6 text-slate-300 text-lg">

          AI search engines rank answers differently than traditional SEO.
          AuthorityOS analyzes the signals that determine whether AI models
          cite your site as a trusted answer.

        </p>

        <ul className="mt-6 space-y-3 text-slate-300">

          <li>• Entity authority signals</li>
          <li>• Structured data and schema markup</li>
          <li>• Topical authority coverage</li>
          <li>• AI citation probability</li>

        </ul>

      </div>

      <img
        src="https://images.unsplash.com/photo-1677442136019-21780ecad995"
        className="rounded-2xl border border-[#eaff00]/30 brightness-110"
      />

    </section>

  )
}

/* ---------------- FEATURES ---------------- */

function Features(){

  const features = [

    {
      title:"Authority Score",
      text:"Measure how authoritative your website appears to AI engines."
    },

    {
      title:"AIO Optimization",
      text:"Identify how well your site is optimized for AI generated answers."
    },

    {
      title:"Entity Signals",
      text:"Detect whether your brand is recognized as a trusted entity."
    },

    {
      title:"Execution Plan",
      text:"Get prioritized improvements to boost authority."
    }

  ]

  return(

    <section className="max-w-6xl mx-auto px-6 py-20">

      <h2 className="text-4xl font-bold text-center text-[#eaff00] mb-16">

        What This Tool Measures

      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

        {features.map((f)=>(
          <Card key={f.title} className="bg-[#111a2b] border border-[#eaff00]/20 hover:border-[#eaff00]/60 transition">

            <CardContent className="p-8">

              <h3 className="text-xl font-bold text-white">

                {f.title}

              </h3>

              <p className="text-slate-400 mt-3">

                {f.text}

              </p>

            </CardContent>

          </Card>
        ))}

      </div>

    </section>

  )
}

/* ---------------- USE CASES ---------------- */

function UseCases(){

  const cases = [

    {
      title:"SEO Agencies",
      text:"Show clients why their website is not appearing in AI answers."
    },

    {
      title:"SaaS Companies",
      text:"Optimize product pages so AI search engines cite your platform."
    },

    {
      title:"Local Businesses",
      text:"Increase visibility in AI powered search results."
    }

  ]

  return(

    <section className="max-w-6xl mx-auto px-6 py-20">

      <h2 className="text-4xl font-bold text-[#eaff00] text-center mb-16">

        Who This Is For

      </h2>

      <div className="grid md:grid-cols-3 gap-10">

        {cases.map((c)=>(
          <Card key={c.title} className="bg-[#111a2b] border border-[#eaff00]/20">

            <CardContent className="p-8">

              <h3 className="text-xl font-bold text-white">

                {c.title}

              </h3>

              <p className="text-slate-400 mt-3">

                {c.text}

              </p>

            </CardContent>

          </Card>
        ))}

      </div>

    </section>

  )
}

/* ---------------- SCANNER ---------------- */

function Scanner({url,setUrl,runScan,loading,error}:any){

  return(

    <section className="max-w-6xl mx-auto px-6 py-20">

      <Card className="bg-[#111a2b]/80 border border-[#eaff00]/30 p-10">

        <CardContent className="space-y-6">

          <h2 className="text-3xl font-bold text-[#eaff00]">

            Run Authority Scan

          </h2>

          <div className="flex flex-col md:flex-row gap-4">

            <Input
              placeholder="Enter website URL"
              value={url}
              onChange={(e)=>setUrl(e.target.value)}
              className="bg-[#070d18] border-[#eaff00]/40 text-white placeholder:text-slate-400"
            />

            <Button
              onClick={runScan}
              className="bg-[#eaff00] text-black font-bold px-8 hover:bg-[#d7f000] hover:shadow-[0_0_20px_rgba(234,255,0,0.7)] transition"
            >

              {loading ? "Scanning..." : "Scan"}

            </Button>

          </div>

          {error && <p className="text-red-400">{error}</p>}

        </CardContent>

      </Card>

    </section>

  )
}

/* ---------------- RESULTS ---------------- */

function Results({scores,recommendations}:any){

  return(

    <section className="max-w-6xl mx-auto px-6 pb-40 space-y-12">

      <h2 className="text-3xl font-bold text-[#eaff00]">

        Results

      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

        {Object.entries(scores).map(([k,v]:any)=>(
          <Card key={k} className="bg-[#111a2b] border border-[#eaff00]/20">

            <CardContent className="p-8 text-center">

              <div className="text-3xl font-bold text-white">

                {v}

              </div>

              <div className="text-slate-400">

                {k}

              </div>

            </CardContent>

          </Card>
        ))}

      </div>

      <div className="space-y-4">

        {recommendations.map((r:string)=>(
          <Card key={r} className="bg-[#111a2b] border border-[#eaff00]/20">

            <CardContent className="p-6">

              {r}

            </CardContent>

          </Card>
        ))}

      </div>

    </section>

  )
}
