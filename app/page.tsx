"use client"

import { useState } from "react"

export default function Home() {

const [url,setUrl] = useState("")
const [competitor,setCompetitor] = useState("")
const [scanType,setScanType] = useState("standard")
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
body:JSON.stringify({
url,
competitor,
scanType
})
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

{/* NAVBAR */}

<div className="max-w-7xl mx-auto flex justify-between items-center py-6 px-6">

<h1 className="text-xl font-semibold tracking-wide text-[#d4ff00]">
AuthorityOS
</h1>

</div>


{/* HERO */}

<section className="max-w-6xl mx-auto px-6 pt-12 pb-10 text-center">

<div className="text-[#d4ff00] font-semibold mb-4 text-lg">

AI Search Authority Scanner

</div>

<h2 className="text-5xl font-bold mb-6">

Will ChatGPT Recommend Your Business?

</h2>

<p className="text-gray-400 text-lg max-w-3xl mx-auto mb-10">

AuthorityOS scans your website and determines how visible your business
is inside AI search engines like ChatGPT, Gemini and Perplexity.

</p>

</section>


{/* PRODUCT PREVIEW IMAGE */}

<section className="max-w-6xl mx-auto px-6 pb-16">

<div className="bg-[#111114] border border-[#1e1e21] rounded-xl p-8 shadow-xl">

<div className="text-sm text-gray-400 mb-6">

Example AI Authority Scan

</div>

<div className="grid md:grid-cols-4 gap-4">

<div className="bg-[#16161a] p-6 rounded-lg border border-[#222]">

<div className="text-gray-400 mb-2">
AI Authority
</div>

<div className="text-3xl font-bold text-[#d4ff00]">
74
</div>

</div>

<div className="bg-[#16161a] p-6 rounded-lg border border-[#222]">

<div className="text-gray-400 mb-2">
AEO Score
</div>

<div className="text-3xl font-bold text-[#d4ff00]">
61
</div>

</div>

<div className="bg-[#16161a] p-6 rounded-lg border border-[#222]">

<div className="text-gray-400 mb-2">
GEO Score
</div>

<div className="text-3xl font-bold text-[#d4ff00]">
58
</div>

</div>

<div className="bg-[#16161a] p-6 rounded-lg border border-[#222]">

<div className="text-gray-400 mb-2">
Entity Authority
</div>

<div className="text-3xl font-bold text-[#d4ff00]">
66
</div>

</div>

</div>

</div>

</section>


{/* SCAN BAR */}

<section className="max-w-6xl mx-auto px-6 pb-20">

<div className="bg-[#111114] border border-[#1e1e21] rounded-xl p-6 shadow-lg">

<div className="grid md:grid-cols-4 gap-4">

<input
value={url}
onChange={e=>setUrl(e.target.value)}
placeholder="Enter website URL"
className="bg-[#1a1a1d] px-4 py-3 rounded-lg text-white border border-[#26262a]"
/>

<input
value={competitor}
onChange={e=>setCompetitor(e.target.value)}
placeholder="Competitor (optional)"
className="bg-[#1a1a1d] px-4 py-3 rounded-lg text-white border border-[#26262a]"
/>

<select
value={scanType}
onChange={(e)=>setScanType(e.target.value)}
className="bg-[#1a1a1d] px-4 py-3 rounded-lg border border-[#26262a]"
>

<option value="light">Light Scan</option>
<option value="standard">Standard Scan</option>
<option value="deep">Deep Scan</option>

</select>

<button
onClick={runScan}
className="bg-[#d4ff00] text-black font-semibold rounded-lg py-3 hover:brightness-110 transition"
>

{loading ? "Scanning..." : "Run Scan"}

</button>

</div>

</div>

</section>


{/* RESULTS */}

{results && (

<section className="max-w-6xl mx-auto px-6 pb-24">

<h3 className="text-2xl mb-8">

Scan Results

</h3>

<div className="grid md:grid-cols-4 gap-6">

{Object.entries(results.scores || {}).map(([k,v])=>(

<div key={k} className="bg-[#141416] p-6 rounded-xl border border-[#1e1e21]">

<div className="text-gray-400 mb-2 capitalize">

{k}

</div>

<div className="text-3xl font-bold text-[#d4ff00]">

{v as number}

</div>

</div>

))}

</div>

</section>

)}

</div>

)

}
