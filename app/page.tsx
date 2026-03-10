"use client"

import { useState } from "react"
import ScoreRing from "../components/ScoreRing"
import AuthorityRadar from "../components/AuthorityRadar"
import ScanProgress from "../components/ScanProgress"

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

          <h1 className="text-5xl font-bold max-w-3xl">
            Will ChatGPT recommend your website?
          </h1>

          <p className="text-gray-400 mt-6 max-w-xl">
            AuthorityOS scans how AI search engines understand your site and
            shows what prevents your business from being trusted and cited.
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
              className="bg-[#eaff00] text-black px-8 py-3 rounded-lg font-semibold hover:opacity-90"
            >
              {loading ? "Scanning..." : "Run Scan"}
            </button>

          </div>

          {loading && <ScanProgress />}

        </section>

        {/* RESULTS */}

        {results && results.scores && (

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

          {/* RADAR */}

          <div className="mt-20">

            <AuthorityRadar scores={results.scores} />

          </div>

          {/* RECOMMENDATIONS */}

          {results.recommendations && (

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

          )}

        </section>

        )}

      </div>

    </main>
  )
}
