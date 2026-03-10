"use client"

import { useState } from "react"
import ScoreRing from "@/components/ScoreRing"
import AuthorityRadar from "@/components/AuthorityRadar"
import ScanProgress from "@/components/ScanProgress"

export default function Home() {

  const [website,setWebsite] = useState("")
  const [competitor,setCompetitor] = useState("")
  const [loading,setLoading] = useState(false)
  const [results,setResults] = useState<any>(null)

  const runScan = async () => {

    if(!website) return

    setLoading(true)
    setResults(null)

    try{

      const res = await fetch("/api/scan",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          website,
          competitor
        })
      })

      const data = await res.json()

      setResults(data)

    }catch(err){

      console.error("Scan failed",err)

    }

    setLoading(false)

  }

  return(

    <main className="min-h-screen bg-[#030712] text-white">

      <div className="max-w-6xl mx-auto px-6">

        {/* HERO */}

        <section className="pt-28 pb-16">

          <h1 className="text-5xl font-bold leading-tight max-w-3xl">
            Will ChatGPT recommend your website?
          </h1>

          <p className="text-gray-400 mt-6 max-w-xl">
            AuthorityOS scans how AI search engines understand your website and
            shows exactly what prevents your business from being trusted,
            cited, and recommended.
          </p>

          {/* INPUTS */}

          <div className="flex flex-col md:flex-row gap-4 mt-10">

            <input
              value={website}
              onChange={(e)=>setWebsite(e.target.value)}
              placeholder="Enter your website"
              className="bg-[#111827] border border-[#1f2937] rounded-lg px-4 py-3 w-full"
            />

            <input
              value={competitor}
              onChange={(e)=>setCompetitor(e.target.value)}
              placeholder="Competitor (optional)"
              className="bg-[#111827] border border-[#1f2937] rounded-lg px-4 py-3 w-full"
            />

            <button
              onClick={runScan}
              className="bg-[#eaff00] text-black px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              {loading ? "Scanning..." : "Run Scan"}
            </button>

          </div>

          {loading && <ScanProgress />}

        </section>

        {/* EXAMPLE SECTION */}

        {!results && (

        <section className="grid md:grid-cols-2 gap-10 mt-16">

          <div className="bg-[#0b1220] p-8 rounded-xl border border-[#1f2937]">

            <h3 className="text-2xl font-semibold mb-4">
              What the scanner analyzes
            </h3>

            <ul className="space-y-3 text-gray-400">

              <li>• Entity signals AI uses to understand your brand</li>
              <li>• Structured schema markup</li>
              <li>• AI answer extraction readiness</li>
              <li>• Internal linking authority</li>
              <li>• Competitor AI visibility gaps</li>

            </ul>

          </div>

          <div className="bg-[#0b1220] p-8 rounded-xl border border-[#1f2937]">

            <h3 className="text-2xl font-semibold mb-4">
              Example scan result
            </h3>

            <div className="space-y-3 text-gray-400">

              <p>Authority Score: <span className="text-green-400">82</span></p>
              <p>AIO Score: <span className="text-yellow-400">61</span></p>
              <p>GEO Score: <span className="text-red-400">38</span></p>
              <p>AEO Score: <span className="text-red-400">22</span></p>

            </div>

            <p className="text-sm text-gray-500 mt-6">
              Top fix: Add organization schema and improve internal linking.
            </p>

          </div>

        </section>

        )}

        {/* RESULTS */}

        {results && (

        <section className="mt-24">

          <h2 className="text-3xl font-bold mb-12">
            Scan Results
          </h2>

          {/* SCORE RINGS */}

          <div className="grid md:grid-cols-4 gap-10">

            <ScoreRing
              score={results.scores.authority}
              label="Authority"
            />

            <ScoreRing
              score={results.scores.aio}
              label="AIO"
            />

            <ScoreRing
              score={results.scores.geo}
              label="GEO"
            />

            <ScoreRing
              score={results.scores.aeo}
              label="AEO"
            />

          </div>

          {/* RADAR CHART */}

          <div className="mt-20">

            <AuthorityRadar scores={results.scores} />

          </div>

          {/* RECOMMENDATIONS */}

          <div className="mt-20">

            <h3 className="text-2xl font-semibold mb-8">
              Recommended Fixes
            </h3>

            <div className="grid md:grid-cols-2 gap-6">

              {results.recommendations.map((rec:any,i:number)=>(
                <div
                  key={i}
                  className="bg-[#0b1220] p-6 rounded-xl border border-[#1f2937]"
                >

                  <h4 className="font-semibold">
                    {rec.title}
                  </h4>

                  <p className="text-sm text-gray-400 mt-2">
                    Why it matters: {rec.reason}
                  </p>

                  <p className="text-sm text-gray-500 mt-2">
                    Fix: {rec.fix}
                  </p>

                </div>
              ))}

            </div>

          </div>

        </section>

        )}

      </div>

    </main>
  )
}
