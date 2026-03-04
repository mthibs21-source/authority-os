"use client"

import { useState } from "react"

function normalize(url:string){
  if(!url.startsWith("http")) return "https://" + url
  return url
}

function color(score:number){

  if(score>=75) return "text-green-400"
  if(score>=45) return "text-orange-400"

  return "text-red-400"

}

export default function Page(){

  const [url,setUrl] = useState("")
  const [competitor,setCompetitor] = useState("")
  const [depth,setDepth] = useState(10)

  const [data,setData] = useState<any>(null)
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState("")

  async function scan(){

    if(!url) return

    setLoading(true)
    setError("")
    setData(null)

    try{

      const res = await fetch("/api/scan",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({
          url:normalize(url),
          competitor,
          depth
        })
      })

      const json = await res.json()

      if(!json.scores){
        setError("Scan failed")
      }else{
        setData(json)
      }

    }catch{
      setError("Scan failed")
    }

    setLoading(false)

  }

  return(

  <div className="min-h-screen bg-[#071020] text-white">

  <div className="max-w-6xl mx-auto px-6 py-10">

  <div className="flex justify-between items-center mb-10">

  <h1 className="text-3xl font-bold text-[#eaff00]">
  AuthorityOS
  </h1>

  <div className="text-sm text-gray-400">
  Built by Uplift Digital
  </div>

  </div>

  <div className="bg-[#0f1a30] p-8 rounded-xl border border-[#eaff00]/20">

  <h2 className="text-2xl font-bold mb-6">
  Run Authority Scan
  </h2>

  <div className="grid md:grid-cols-3 gap-4 mb-6">

  <input
  value={url}
  onChange={(e)=>setUrl(e.target.value)}
  placeholder="Website URL"
  className="bg-[#071020] border border-[#eaff00]/20 p-3 rounded"
  />

  <input
  value={competitor}
  onChange={(e)=>setCompetitor(e.target.value)}
  placeholder="Competitor URL"
  className="bg-[#071020] border border-[#eaff00]/20 p-3 rounded"
  />

  <select
  value={depth}
  onChange={(e)=>setDepth(Number(e.target.value))}
  className="bg-[#071020] border border-[#eaff00]/20 p-3 rounded"
  >

  <option value={3}>Light crawl</option>
  <option value={10}>Standard crawl</option>
  <option value={25}>Deep crawl</option>

  </select>

  </div>

  <button
  onClick={scan}
  className="bg-[#eaff00] text-black font-bold px-6 py-3 rounded hover:brightness-110"
  >

  {loading ? "Scanning..." : "Scan"}

  </button>

  {error &&

  <div className="text-red-400 mt-4">
  {error}
  </div>

  }

  </div>

  {data &&

  <div className="mt-12 space-y-12">

  <div className="grid md:grid-cols-4 gap-6">

  {Object.entries(data.scores).map(([key,value]:any)=>(
  <div key={key} className="bg-[#0f1a30] p-6 rounded border border-white/10">
  <div className="text-gray-400 text-sm mb-2">
  {key.toUpperCase()}
  </div>
  <div className={`text-4xl font-bold ${color(value)}`}>
  {value}
  </div>
  </div>
  ))}

  </div>

  <div className="bg-[#0f1a30] p-6 rounded border border-white/10">

  <h3 className="font-bold mb-4">
  Topical Authority Map
  </h3>

  <div className="flex flex-wrap gap-2">

  {data.topicMap.map((t:any,i:number)=>(
  <span key={i} className="px-3 py-1 bg-[#eaff00]/20 rounded">
  {t[0]} ({t[1]})
  </span>
  ))}

  </div>

  </div>

  <div className="bg-[#0f1a30] p-6 rounded border border-white/10">

  <h3 className="font-bold mb-4">
  Content Opportunities
  </h3>

  <ul className="space-y-2">

  {data.opportunities.map((o:string,i:number)=>(
  <li key={i}>
  {o}
  </li>
  ))}

  </ul>

  </div>

  <div className="bg-[#0f1a30] p-6 rounded border border-white/10">

  <h3 className="font-bold mb-4">
  Pages Crawled
  </h3>

  <div className="space-y-2">

  {data.pages.map((p:any,i:number)=>(
  <div key={i} className="flex justify-between text-sm">
  <div className="truncate w-[70%]">{p.url}</div>
  <div className={color(p.score)}>{p.score}</div>
  </div>
  ))}

  </div>

  </div>

  </div>

  }

  </div>

  </div>

  )

}
