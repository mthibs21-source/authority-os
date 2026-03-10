"use client"

import { useState } from "react"

export default function Home() {

  const [url,setUrl] = useState("")
  const [competitor,setCompetitor] = useState("")
  const [data,setData] = useState<any>(null)
  const [loading,setLoading] = useState(false)

  async function scan(){

    setLoading(true)

    const res = await fetch("/api/scan",{
      method:"POST",
      headers:{ "Content-Type":"application/json"},
      body:JSON.stringify({url,competitor})
    })

    const json = await res.json()

    setData(json)

    setLoading(false)

  }

  return(

    <main className="min-h-screen bg-[#020617] text-white">

      <div className="max-w-7xl mx-auto p-8">

        {/* HEADER */}

        <div className="text-[#eaff00] font-semibold mb-12">
          AI Visibility Scanner
        </div>


        {/* HERO */}

        <div className="grid grid-cols-2 gap-16 items-center mb-20">

          <div>

            <h1 className="text-6xl font-bold leading-tight mb-6">

              Will <span className="text-[#eaff00]">ChatGPT</span><br/>

              Recommend<br/>

              Your Website?

            </h1>

            <p className="text-gray-400 text-lg mb-8 max-w-xl">

              AI search engines like ChatGPT, Gemini, and Perplexity now
              recommend businesses directly to users.

              This scanner shows whether AI trusts your website,
              where you're losing visibility, and exactly what to fix
              so AI starts recommending you.

            </p>

            <div className="flex flex-wrap gap-3 mb-10 text-sm">

              <div className="px-4 py-2 bg-[#0f172a] rounded-full border border-[#1e293b]">
                AI trust signals
              </div>

              <div className="px-4 py-2 bg-[#0f172a] rounded-full border border-[#1e293b]">
                Schema & entity detection
              </div>

              <div className="px-4 py-2 bg-[#0f172a] rounded-full border border-[#1e293b]">
                Competitor comparison
              </div>

              <div className="px-4 py-2 bg-[#0f172a] rounded-full border border-[#1e293b]">
                Recommendation likelihood
              </div>

            </div>


            {/* SCAN BAR */}

            <div className="flex gap-3">

              <input
                placeholder="Enter website"
                value={url}
                onChange={(e)=>setUrl(e.target.value)}
                className="bg-[#0f172a] border border-[#1e293b] p-3 rounded w-full"
              />

              <input
                placeholder="Competitor"
                value={competitor}
                onChange={(e)=>setCompetitor(e.target.value)}
                className="bg-[#0f172a] border border-[#1e293b] p-3 rounded w-full"
              />

              <button
                onClick={scan}
                className="bg-[#eaff00] text-black px-6 rounded font-semibold"
              >
                {loading ? "Scanning..." : "Scan"}
              </button>

            </div>

          </div>


          {/* RIGHT PANEL */}

          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-8">

            <div className="text-gray-400 mb-6">
              What you'll discover
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">

              <div className="bg-[#020617] p-4 rounded-lg border border-[#1e293b]">

                <div className="font-semibold">
                  AI Trust Score
                </div>

                <div className="text-gray-400 text-sm">
                  See if AI trusts your site enough to recommend it
                </div>

              </div>

              <div className="bg-[#020617] p-4 rounded-lg border border-[#1e293b]">

                <div className="font-semibold">
                  Why AI Doesn't Recommend You
                </div>

                <div className="text-gray-400 text-sm">
                  The missing signals AI uses to decide trust
                </div>

              </div>

              <div className="bg-[#020617] p-4 rounded-lg border border-[#1e293b]">

                <div className="font-semibold">
                  Pages Holding You Back
                </div>

                <div className="text-gray-400 text-sm">
                  Which URLs weaken your AI visibility
                </div>

              </div>

              <div className="bg-[#020617] p-4 rounded-lg border border-[#1e293b]">

                <div className="font-semibold">
                  How to Fix It
                </div>

                <div className="text-gray-400 text-sm">
                  Clear steps to increase AI recommendation likelihood
                </div>

              </div>

            </div>

            <div className="text-gray-400 text-sm mb-2">
              Example outcome
            </div>

            <div className="font-semibold mb-4">

              Add organization schema, strengthen topical authority,
              and expand FAQ answers so AI systems confidently
              recommend your website.

            </div>

            <div className="w-full bg-[#1e293b] h-2 rounded">

              <div className="bg-[#eaff00] h-2 rounded w-[60%]" />

            </div>

            <div className="text-gray-400 text-sm mt-2">
              Potential AI visibility increase: +14%
            </div>

          </div>

        </div>

      </div>

    </main>

  )

}
