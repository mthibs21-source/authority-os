"use client";

import { useState } from "react";

/* ---------------- COLORS ---------------- */

function scoreColor(score:number){

if(score >= 75) return "text-green-400 border-green-500/30 bg-green-500/10"
if(score >= 45) return "text-orange-400 border-orange-500/30 bg-orange-500/10"

return "text-red-400 border-red-500/30 bg-red-500/10"

}

/* ---------------- URL NORMALIZER ---------------- */

function normalize(url:string){

if(!url.startsWith("http")) return "https://" + url

return url

}

/* ---------------- PAGE ---------------- */

export default function Page(){

const [url,setUrl] = useState("")
const [competitor,setCompetitor] = useState("")
const [depth,setDepth] = useState(10)

const [data,setData] = useState<any>(null)
const [loading,setLoading] = useState(false)
const [error,setError] = useState("")

/* ---------------- SCAN ---------------- */

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

/* ---------------- UI ---------------- */

return(

<div className="min-h-screen bg-[#070d18] text-white">

{/* GRID BACKGROUND */}

<div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:40px_40px]" />

{/* HERO */}

<section className="relative max-w-6xl mx-auto px-6 pt-28 pb-20 grid lg:grid-cols-2 gap-16 items-center">

<div>

<h1 className="text-6xl font-extrabold leading-tight">

Become the <span className="text-[#eaff00]">Authority</span>  
AI Engines Cite

</h1>

<p className="mt-6 text-slate-300 text-lg max-w-xl">

AuthorityOS analyzes your website like modern AI search engines.

Discover your authority score, topical coverage, entity signals and the exact content needed to dominate AI search.

</p>

<div className="mt-10 flex gap-4">

<button
onClick={()=>document.getElementById("scan")?.scrollIntoView({behavior:"smooth"})}
className="bg-[#eaff00] text-black font-bold px-6 py-3 rounded-xl hover:brightness-110"
>

Start Authority Scan

</button>

</div>

</div>

{/* HERO VISUAL */}

<div className="flex justify-center">

<img
src="https://images.unsplash.com/photo-1551281044-8f9b6c4d9f3b"
className="rounded-2xl shadow-2xl border border-[#eaff00]/20"
/>

</div>

</section>

{/* FEATURES */}

<section className="max-w-6xl mx-auto px-6 pb-24">

<div className="grid md:grid-cols-3 gap-10">

<div className="bg-[#111a2b] p-8 rounded-xl border border-[#eaff00]/10">

<h3 className="font-bold text-xl mb-2">

AI Authority Scoring

</h3>

<p className="text-slate-400">

See how AI search engines evaluate your site authority across entity signals, citation likelihood and topical depth.

</p>

</div>

<div className="bg-[#111a2b] p-8 rounded-xl border border-[#eaff00]/10">

<h3 className="font-bold text-xl mb-2">

Topical Authority Map

</h3>

<p className="text-slate-400">

Discover which topics your site truly owns and which high value content clusters are missing.

</p>

</div>

<div className="bg-[#111a2b] p-8 rounded-xl border border-[#eaff00]/10">

<h3 className="font-bold text-xl mb-2">

Content Opportunity Engine

</h3>

<p className="text-slate-400">

Automatically generate high ranking pages to build authority faster than competitors.

</p>

</div>

</div>

</section>

{/* SCAN */}

<section id="scan" className="max-w-6xl mx-auto px-6 pb-24">

<div className="bg-[#111a2b] p-10 rounded-xl border border-[#eaff00]/20">

<h2 className="text-3xl font-bold text-[#eaff00] mb-6">

Run Authority Scan

</h2>

<div className="grid md:grid-cols-3 gap-4 mb-6">

<input
value={url}
onChange={(e)=>setUrl(e.target.value)}
placeholder="Website URL"
className="bg-[#070d18] border border-[#eaff00]/20 p-3 rounded"
/>

<input
value={competitor}
onChange={(e)=>setCompetitor(e.target.value)}
placeholder="Competitor URL"
className="bg-[#070d18] border border-[#eaff00]/20 p-3 rounded"
/>

<select
value={depth}
onChange={(e)=>setDepth(Number(e.target.value))}
className="bg-[#070d18] border border-[#eaff00]/20 p-3 rounded"
>

<option value={3}>Light crawl</option>
<option value={10}>Standard crawl</option>
<option value={25}>Deep crawl</option>

</select>

</div>

<button
onClick={scan}
className="bg-[#eaff00] text-black font-bold px-8 py-3 rounded-xl hover:brightness-110"
>

{loading ? "Scanning..." : "Scan Website"}

</button>

{error &&

<div className="text-red-400 mt-4">

{error}

</div>

}

</div>

</section>

{/* RESULTS */}

{data && (

<section className="max-w-6xl mx-auto px-6 pb-28 space-y-12">

{/* SCORES */}

<div className="grid md:grid-cols-4 gap-6">

{Object.entries(data.scores).map(([key,value]:any)=>(

<div
key={key}
className={`p-6 rounded-xl border ${scoreColor(value)}`}
>

<div className="text-xs mb-2 uppercase">

{key}

</div>

<div className="text-4xl font-bold">

{value}

</div>

</div>

))}

</div>

{/* TOPIC MAP */}

<div className="bg-[#111a2b] p-8 rounded-xl border border-[#eaff00]/10">

<h3 className="text-xl font-bold mb-4">

Topical Authority Map

</h3>

<div className="flex flex-wrap gap-2">

{data.topicMap.map((t:any,i:number)=>(

<span
key={i}
className="px-3 py-1 bg-[#eaff00]/20 rounded-full text-sm"
>

{t[0]} ({t[1]})

</span>

))}

</div>

</div>

{/* CONTENT OPPORTUNITIES */}

<div className="bg-[#111a2b] p-8 rounded-xl border border-[#eaff00]/10">

<h3 className="text-xl font-bold mb-4">

Content Opportunities

</h3>

<ul className="space-y-2 text-slate-300">

{data.opportunities.map((o:string,i:number)=>(
<li key={i}>{o}</li>
))}

</ul>

</div>

{/* PAGES */}

<div className="bg-[#111a2b] p-8 rounded-xl border border-[#eaff00]/10">

<h3 className="text-xl font-bold mb-4">

Pages Crawled

</h3>

<div className="space-y-2">

{data.pages.map((p:any,i:number)=>(

<div
key={i}
className="flex justify-between text-sm border-b border-white/10 pb-2"
>

<div className="truncate w-[70%]">

{p.url}

</div>

<div className={scoreColor(p.score)}>

{p.score}

</div>

</div>

))}

</div>

</div>

</section>

)}

{/* FOOTER */}

<footer className="text-center text-sm text-slate-500 pb-10">

Built by Uplift Digital

</footer>

</div>

)

}
