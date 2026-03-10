"use client";

import React, { useState } from "react";

export default function AuthorityOS() {

const [url,setUrl] = useState("")
const [competitor,setCompetitor] = useState("")
const [loading,setLoading] = useState(false)
const [data,setData] = useState<any>(null)

async function runScan(){

if(!url) return alert("Enter a website")

setLoading(true)
setData(null)

let formatted = url

if(!formatted.startsWith("http")){
formatted = "https://" + formatted
}

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

const json = await res.json()

setData(json)

}catch(err){

console.error(err)
alert("Scan failed")

}

setLoading(false)

}

return (

<div className="min-h-screen bg-[#070d18] text-white">

{/* HERO */}

<div className="max-w-6xl mx-auto px-6 pt-20 pb-10">

<h1 className="text-6xl font-extrabold leading-tight">
Will <span className="text-[#eaff00]">ChatGPT Recommend</span> Your Website?
</h1>

<p className="mt-6 text-slate-300 max-w-xl text-lg">
AI search engines now recommend businesses directly.
This scanner shows whether AI understands, trusts,
and cites your website — and exactly what to fix.
</p>

</div>

{/* SCAN INPUT */}

<div className="max-w-6xl mx-auto px-6 pb-12">

<div className="grid md:grid-cols-3 gap-4">

<input
placeholder="Your website"
value={url}
onChange={(e)=>setUrl(e.target.value)}
className="bg-[#070d18] border border-[#eaff00]/30 p-3 rounded"
/>

<input
placeholder="Competitor (optional)"
value={competitor}
onChange={(e)=>setCompetitor(e.target.value)}
className="bg-[#070d18] border border-[#eaff00]/30 p-3 rounded"
/>

<button
onClick={runScan}
className="bg-[#eaff00] text-black font-bold rounded"
>
{loading ? "Analyzing..." : "Run Scan"}
</button>

</div>

</div>

{/* EXAMPLE RESULT BEFORE SCAN */}

{!data && (

<div className="max-w-6xl mx-auto px-6 pb-20">

<h2 className="text-2xl font-bold mb-8">
Example Scan Output
</h2>

<div className="grid md:grid-cols-4 gap-6">

<Score label="Authority" score={82}/>
<Score label="AIO" score={67}/>
<Score label="GEO" score={44}/>
<Score label="AEO" score={25}/>

</div>

<div className="mt-10 grid md:grid-cols-2 gap-6">

<ExampleCard
title="Add FAQ schema"
desc="AI search engines extract direct answers from structured question sections."
/>

<ExampleCard
title="Improve internal linking"
desc="Topical clusters increase entity authority for AI systems."
/>

<ExampleCard
title="Add Organization schema"
desc="AI models rely heavily on structured entity markup."
/>

<ExampleCard
title="Expand service page content"
desc="AI answers typically cite authoritative long form pages."
/>

</div>

</div>

)}

{/* RESULTS */}

{data && (

<div className="max-w-6xl mx-auto px-6 pb-20 space-y-12">

<div className="grid md:grid-cols-4 gap-6">

<Score label="Authority" score={data.scores.authority}/>
<Score label="AIO" score={data.scores.aio}/>
<Score label="GEO" score={data.scores.geo}/>
<Score label="AEO" score={data.scores.aeo}/>

</div>

{/* RECOMMENDATIONS */}

<div>

<h2 className="text-2xl font-bold mb-6">
Recommended Improvements
</h2>

<div className="grid md:grid-cols-2 gap-6">

{data.recommendations.map((r:any,i:number)=>(
<div key={i} className="bg-[#111a2b] border border-[#eaff00]/25 p-6 rounded">

<div className="text-[#eaff00] text-sm mb-2">
{r.category}
</div>

<div className="font-semibold mb-2">
{r.title}
</div>

<div className="text-slate-300 text-sm mb-2">
{r.reason}
</div>

<div className="text-sm text-white">
Fix: {r.fix}
</div>

</div>
))}

</div>

</div>

</div>

)}

</div>

)
}

function Score({label,score}:{label:string,score:number}){

let tier = "Needs Work"
let color = "text-orange-300"

if(score >= 75){
tier = "Strong"
color = "text-green-400"
}

if(score < 45){
tier = "Critical"
color = "text-red-400"
}

return(

<div className="bg-[#111a2b] border border-white/10 p-6 rounded text-center">

<div className="text-sm text-slate-300 mb-2">
{label}
</div>

<div className={`text-4xl font-bold ${color}`}>
{score}
</div>

<div className="text-xs text-slate-400 mt-1">
{tier}
</div>

</div>

)
}

function ExampleCard({title,desc}:{title:string,desc:string}){

return(

<div className="bg-[#111a2b] border border-[#eaff00]/25 p-6 rounded">

<div className="font-semibold text-[#eaff00] mb-2">
{title}
</div>

<div className="text-slate-300 text-sm">
{desc}
</div>

</div>

)
}
