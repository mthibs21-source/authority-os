"use client"

import { useState } from "react"

export default function Home() {

  const [website,setWebsite] = useState("")
  const [competitor,setCompetitor] = useState("")
  const [loading,setLoading] = useState(false)
  const [results,setResults] = useState<any>(null)

  const runScan = async () => {

    if(!website){
      alert("Enter a website")
      return
    }

    let formatted = website

    if(!formatted.startsWith("http")){
      formatted = "https://" + formatted
    }

    console.log("Scanning:",formatted)

    setLoading(true)
    setResults(null)

    try{

      const res = await fetch("/api/scan",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          website:formatted,
          competitor
        })
      })

      console.log("API status:",res.status)

      if(!res.ok){

        const text = await res.text()
        console.error("API error:",text)

        alert("Scan failed. Check console.")
        setLoading(false)
        return
      }

      const data = await res.json()

      console.log("Scan result:",data)

      setResults(data)

    }catch(err){

      console.error("Scan crashed:",err)
      alert("Scan crashed. See console.")

    }

    setLoading(false)
  }

  return (

    <main className="min-h-screen bg-black text-white">

      <div className="max-w-6xl mx-auto p-10">

        <h1 className="text-5xl font-bold mb-8">
          Will AI recommend your website?
        </h1>

        <p className="text-gray-400 mb-10">
          Scan your website to see if AI search engines trust, understand,
          and cite your content.
        </p>

        <div className="flex gap-4 mb-10">

          <input
            value={website}
            onChange={(e)=>setWebsite(e.target.value)}
            placeholder="Your website"
            className="bg-neutral-900 border border-neutral-700 p-3 rounded w-full"
          />

          <input
            value={competitor}
            onChange={(e)=>setCompetitor(e.target.value)}
            placeholder="Competitor (optional)"
            className="bg-neutral-900 border border-neutral-700 p-3 rounded w-full"
          />

          <button
            onClick={runScan}
            className="bg-yellow-400 text-black font-semibold px-6 rounded"
          >
            {loading ? "Scanning..." : "Run Scan"}
          </button>

        </div>

        {loading && (

          <div className="text-gray-400 space-y-2 mb-10">

            <p>Analyzing entities...</p>
            <p>Checking schema...</p>
            <p>Mapping internal links...</p>
            <p>Evaluating AI extraction...</p>

          </div>

        )}

        {results && (

          <div className="space-y-10">

            <div className="grid grid-cols-4 gap-6">

              <Score title="Authority" value={results.scores.authority}/>
              <Score title="AIO" value={results.scores.aio}/>
              <Score title="GEO" value={results.scores.geo}/>
              <Score title="AEO" value={results.scores.aeo}/>

            </div>

            <div>

              <h2 className="text-xl mb-4">Recommendations</h2>

              <div className="space-y-4">

                {results.recommendations.map((r:any,i:number)=>(
                  <div key={i} className="bg-neutral-900 border border-neutral-700 p-4 rounded">

                    <div className="font-semibold mb-1">
                      {r.title}
                    </div>

                    <div className="text-gray-400 text-sm mb-2">
                      {r.reason}
                    </div>

                    <div className="text-yellow-400 text-sm">
                      Fix: {r.fix}
                    </div>

                  </div>
                ))}

              </div>

            </div>

          </div>

        )}

      </div>

    </main>

  )
}

function Score({title,value}:{title:string,value:number}){

  return(
    <div className="bg-neutral-900 border border-neutral-700 p-6 rounded text-center">

      <div className="text-gray-400 text-sm mb-2">
        {title}
      </div>

      <div className="text-3xl font-bold text-yellow-400">
        {value}
      </div>

    </div>
  )
}
