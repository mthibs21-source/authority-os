"use client"

import { useState } from "react"

export default function Home(){

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

const data = await res.json()

setResults(data)

}catch(err){

console.error(err)

}

setLoading(false)

}

return(

<main className="min-h-screen bg-black text-white">

<div className="max-w-6xl mx-auto px-8 py-16">

<h1 className="text-5xl font-bold mb-6">
Will ChatGPT Recommend Your Website?
</h1>

<p className="text-gray-400 mb-12 max-w-2xl">
AI search engines now recommend businesses directly. This scanner shows
whether AI understands, trusts, and cites your website — and exactly what to fix.
</p>

{/* SCAN INPUT */}

<div className="flex gap-4 mb-16">

<input
value={website}
onChange={(e)=>setWebsite(e.target.value)}
placeholder="Your website"
className="bg-neutral-900 border border-yellow-400 p-3 rounded w-full"
/>

<input
value={competitor}
onChange={(e)=>setCompetitor(e.target.value)}
placeholder="Competitor (optional)"
className="bg-neutral-900 border border-yellow-400 p-3 rounded w-full"
/>

<button
onClick={runScan}
className="bg-[#eaff00] text-black px-8 font-semibold rounded"
>
{loading ? "Scanning..." : "Run Scan"}
</button>

</div>

{/* EXAMPLE DASHBOARD */}

{!results && (

<div className="mb-20">

<h2 className="text-2xl font-semibold mb-6">
Example Scan Result
</h2>

<div className="grid grid-cols-4 gap-6">

<Score title="Authority" value="82"/>
<Score title="AIO" value="64"/>
<Score title="GEO" value="48"/>
<Score title="AEO" value="22"/>

</div>

<div className="mt-10 grid md:grid-cols-2 gap-6">

<ExampleCard
title="Add FAQ schema"
desc="AI search engines extract direct answers from structured question content."
/>

<ExampleCard
title="Improve internal linking"
desc="Entity clusters help AI understand topical authority."
/>

<ExampleCard
title="Add organization schema"
desc="This helps AI engines clearly identify your brand entity."
/>

<ExampleCard
title="Strengthen service pages"
desc="AI answers often cite pages with strong headings and answer sections."
/>

</div>

</div>

)}

{/* LOADING */}

{loading && (

<div className="text-gray-400 space-y-2 mb-10">

<p>Analyzing entities...</p>
<p>Checking schema...</p>
<p>Mapping internal links...</p>
<p>Evaluating AI extraction...</p>

</div>

)}

{/* RESULTS */}

{results && (

<div className="space-y-16">

<div className="grid grid-cols-4 gap-6">

<Score title="Authority" value={results.scores.authority}/>
<Score title="AIO" value={results.scores.aio}/>
<Score title="GEO" value={results.scores.geo}/>
<Score title="AEO" value={results.scores.aeo}/>

</div>

{/* RECOMMENDATIONS */}

<div>

<h2 className="text-xl mb-6">
Recommended Improvements
</h2>

<div className="grid md:grid-cols-2 gap-6">

{results.recommendations.map((r:any,i:number)=>(
<div key={i} className="bg-neutral-900 border border-yellow-400 p-6 rounded">

<div className="text-yellow-400 font-semibold mb-2">
{r.category}
</div>

<div className="font-semibold mb-2">
{r.title}
</div>

<div className="text-gray-400 text-sm mb-2">
{r.reason}
</div>

<div className="text-sm">
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

function Score({title,value}:{title:string,value:any}){

return(
<div className="bg-neutral-900 border border-yellow-400 p-6 rounded text-center">

<div className="text-gray-400 text-sm mb-2">
{title}
</div>

<div className="text-3xl font-bold text-yellow-400">
{value}
</div>

</div>
)
}

function ExampleCard({title,desc}:{title:string,desc:string}){

return(
<div className="bg-neutral-900 border border-yellow-400 p-6 rounded">

<div className="font-semibold mb-2 text-yellow-400">
{title}
</div>

<div className="text-gray-400 text-sm">
{desc}
</div>

</div>
)
}
