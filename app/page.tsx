"use client"

import { useState } from "react"

export default function Home() {

const [url,setUrl] = useState("")
const [loading,setLoading] = useState(false)
const [results,setResults] = useState<any>(null)

async function runScan(){

if(!url) return

setLoading(true)

try{

const res = await fetch("/api/scan",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({url})
})

const data = await res.json()

setResults(data)

}catch(e){

console.error(e)

}

setLoading(false)

}

return (

<div className="min-h-screen bg-[#0b0b0d] text-white">

{/* NAV */}

<div className="max-w-6xl mx-auto flex justify-between items-center py-6 px-6">

<h1 className="text-xl font-semibold">
AuthorityOS
</h1>

<button className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg transition">
Public Beta
</button>

</div>


{/* HERO */}

<section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-14 items-center">

<div>

<h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
Understand Your Authority in AI Search
</h2>

<p className="text-gray-300 mb-8 text-lg">
AuthorityOS analyzes how visible your website is to modern AI search engines like ChatGPT, Gemini and Perplexity.
Scan your site to understand your AI authority, entity signals and content opportunities.
</p>

<div className="flex gap-3">

<input
value={url}
onChange={e=>setUrl(e.target.value)}
placeholder="enter your website url"
className="px-4 py-3 rounded-lg text-black w-full"
/>

<button
onClick={runScan}
className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition"
>
{loading ? "Scanning..." : "Run Scan"}
</button>

</div>

</div>


{/* PRODUCT PREVIEW */}

<div className="bg-[#141416] rounded-xl p-8 shadow-lg border border-[#1e1e21]">

<div className="text-sm text-gray-400 mb-4">
Authority Dashboard Preview
</div>

<div className="space-y-3">

<div className="bg-[#1e1e21] p-3 rounded-lg flex justify-between">
<span>AI Authority</span>
<span className="font-bold">74</span>
</div>

<div className="bg-[#1e1e21] p-3 rounded-lg flex justify-between">
<span>AEO Score</span>
<span className="font-bold">61</span>
</div>

<div className="bg-[#1e1e21] p-3 rounded-lg flex justify-between">
<span>GEO Score</span>
<span className="font-bold">58</span>
</div>

<div className="bg-[#1e1e21] p-3 rounded-lg flex justify-between">
<span>Entity Authority</span>
<span className="font-bold">66</span>
</div>

</div>

</div>

</section>


{/* RESULTS */}

{results && (

<section className="max-w-5xl mx-auto px-6 pb-20">

<h3 className="text-2xl mb-8">
Scan Results
</h3>

<div className="grid grid-cols-2 md:grid-cols-4 gap-4">

{Object.entries(results.scores || {}).map(([k,v])=>(
<div key={k} className="bg-[#141416] p-6 rounded-xl border border-[#1f1f22]">

<div className="text-gray-400 text-sm mb-2 capitalize">
{k}
</div>

<div className="text-2xl font-bold">
{v as number}
</div>

</div>
))}

</div>

</section>

)}


{/* HOW IT WORKS */}

<section className="max-w-6xl mx-auto px-6 py-20">

<h3 className="text-3xl font-bold mb-12 text-center">
How AuthorityOS Works
</h3>

<div className="grid md:grid-cols-3 gap-10">

<div>

<h4 className="text-xl mb-2">
Scan Your Website
</h4>

<p className="text-gray-400">
AuthorityOS crawls your pages and analyzes entity signals,
content depth and topical authority.
</p>

</div>

<div>

<h4 className="text-xl mb-2">
Measure AI Visibility
</h4>

<p className="text-gray-400">
Understand how well your website appears inside AI generated answers and knowledge graphs.
</p>

</div>

<div>

<h4 className="text-xl mb-2">
Find Growth Opportunities
</h4>

<p className="text-gray-400">
Identify authority gaps, missing topics and content clusters that competitors dominate.
</p>

</div>

</div>

</section>


{/* USE CASES */}

<section className="bg-[#111114] py-20">

<div className="max-w-6xl mx-auto px-6">

<h3 className="text-3xl font-bold mb-12 text-center">
Who Uses AuthorityOS
</h3>

<div className="grid md:grid-cols-3 gap-10">

<div className="bg-[#18181b] p-6 rounded-xl border border-[#222]">

<h4 className="text-lg mb-2">
SEO Agencies
</h4>

<p className="text-gray-400">
Audit client authority and show measurable AI search improvements.
</p>

</div>

<div className="bg-[#18181b] p-6 rounded-xl border border-[#222]">

<h4 className="text-lg mb-2">
SaaS Founders
</h4>

<p className="text-gray-400">
Understand how AI interprets your product pages and category positioning.
</p>

</div>

<div className="bg-[#18181b] p-6 rounded-xl border border-[#222]">

<h4 className="text-lg mb-2">
Local Businesses
</h4>

<p className="text-gray-400">
Win AI generated recommendations in local search and conversational queries.
</p>

</div>

</div>

</div>

</section>


{/* FEATURES */}

<section className="max-w-6xl mx-auto px-6 py-20">

<h3 className="text-3xl font-bold mb-12 text-center">
Platform Features
</h3>

<div className="grid md:grid-cols-3 gap-10">

<div>
<h4 className="text-lg mb-2">AI Authority Score</h4>
<p className="text-gray-400">
Measures how authoritative your website appears to AI systems.
</p>
</div>

<div>
<h4 className="text-lg mb-2">Topic Gap Analysis</h4>
<p className="text-gray-400">
Identify missing topics preventing AI from recommending your site.
</p>
</div>

<div>
<h4 className="text-lg mb-2">Entity Authority Signals</h4>
<p className="text-gray-400">
Analyze entity relationships and structured knowledge signals.
</p>
</div>

</div>

</section>


{/* FUTURE PRICING */}

<section className="max-w-5xl mx-auto px-6 py-24 text-center">

<h3 className="text-3xl font-bold mb-6">
AuthorityOS Pro
</h3>

<p className="text-gray-400 mb-10">
Advanced AI visibility analytics and competitor tracking coming soon.
</p>

<div className="bg-[#141416] p-10 rounded-xl border border-[#222] inline-block">

<div className="text-4xl font-bold mb-4">
Launching Soon
</div>

<button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg transition">
Join Early Access
</button>

</div>

</section>

</div>

)

}
