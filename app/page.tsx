"use client"

import { useState } from "react"
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from "recharts"

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

  function ScoreCircle({value}:{value:number}){

    const d=[{name:"score",value}]

    return(

      <div style={{width:120,height:120}}>

        <ResponsiveContainer>

          <RadialBarChart
            innerRadius="80%"
            outerRadius="100%"
            data={d}
            startAngle={90}
            endAngle={-270}
          >

            <RadialBar
              dataKey="value"
              fill="#eaff00"
              cornerRadius={10}
            />

          </RadialBarChart>

        </ResponsiveContainer>

      </div>

    )

  }

  function RadarVisual(){

    if(!data) return null

    const radarData=[
      {subject:"Authority",value:data.scores.authority},
      {subject:"AIO",value:data.scores.aio},
      {subject:"GEO",value:data.scores.geo},
      {subject:"AEO",value:data.scores.aeo}
    ]

    return(

      <div style={{width:"100%",height:260}}>

        <ResponsiveContainer>

          <RadarChart data={radarData}>

            <PolarGrid stroke="#2a2a2a" />

            <PolarAngleAxis dataKey="subject" stroke="#888"/>

            <Radar
              dataKey="value"
              stroke="#eaff00"
              fill="#eaff00"
              fillOpacity={0.35}
            />

          </RadarChart>

        </ResponsiveContainer>

      </div>

    )

  }

  return(

    <main className="min-h-screen bg-[#020617] text-white">

      <div className="max-w-6xl mx-auto p-8">

        <h1 className="text-3xl font-bold mb-6 text-[#eaff00]">
          AuthorityOS
        </h1>

        <div className="flex gap-3 mb-8">

          <input
            placeholder="Website URL"
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

        {data && (

          <>
            {/* SCORE CARDS */}

            <div className="grid grid-cols-4 gap-6 mb-10">

              <div className="bg-[#0f172a] p-6 rounded-xl">

                <ScoreCircle value={data.scores.authority}/>

                <h3 className="mt-4 text-lg font-semibold">
                  Authority
                </h3>

                <p className="text-gray-400">
                  {data.scores.authority} / 100
                </p>

              </div>

              <div className="bg-[#0f172a] p-6 rounded-xl">

                <ScoreCircle value={data.scores.aio}/>

                <h3 className="mt-4 text-lg font-semibold">
                  AIO
                </h3>

                <p className="text-gray-400">
                  {data.scores.aio} / 100
                </p>

              </div>

              <div className="bg-[#0f172a] p-6 rounded-xl">

                <ScoreCircle value={data.scores.geo}/>

                <h3 className="mt-4 text-lg font-semibold">
                  GEO
                </h3>

                <p className="text-gray-400">
                  {data.scores.geo} / 100
                </p>

              </div>

              <div className="bg-[#0f172a] p-6 rounded-xl">

                <ScoreCircle value={data.scores.aeo}/>

                <h3 className="mt-4 text-lg font-semibold">
                  AEO
                </h3>

                <p className="text-gray-400">
                  {data.scores.aeo} / 100
                </p>

              </div>

            </div>

            {/* RADAR GRAPH */}

            <div className="bg-[#0f172a] rounded-xl p-6 mb-10">

              <h2 className="text-xl mb-4">
                Authority Breakdown
              </h2>

              <RadarVisual/>

            </div>

            {/* WEBSITE PREVIEW */}

            <div className="grid grid-cols-2 gap-6 mb-10">

              <div className="bg-[#0f172a] p-6 rounded-xl">

                <h3 className="mb-4">Website Preview</h3>

                <img
                  src={data.previewImage}
                  className="rounded-lg"
                />

              </div>

              <div className="bg-[#0f172a] p-6 rounded-xl">

                <h3 className="mb-4">Entities</h3>

                <div className="flex flex-wrap gap-2">

                  {data.entities.map((e:string,i:number)=>(
                    <span
                      key={i}
                      className="bg-[#1e293b] px-3 py-1 rounded"
                    >
                      {e}
                    </span>
                  ))}

                </div>

              </div>

            </div>

            {/* RECOMMENDATIONS */}

            <div className="bg-[#0f172a] p-6 rounded-xl">

              <h2 className="text-xl mb-6">
                Recommendations
              </h2>

              <div className="space-y-4">

                {data.recommendations.map((r:any,i:number)=>(
                  <div
                    key={i}
                    className="bg-[#020617] p-4 rounded-lg border border-[#1e293b]"
                  >

                    <h4 className="font-semibold mb-2">
                      {r.title}
                    </h4>

                    <p className="text-gray-400 mb-2">
                      {r.why}
                    </p>

                    <ul className="text-gray-300 list-disc ml-5">

                      {r.how.map((h:string,j:number)=>(
                        <li key={j}>{h}</li>
                      ))}

                    </ul>

                  </div>
                ))}

              </div>

            </div>

          </>
        )}

      </div>

    </main>

  )

}
