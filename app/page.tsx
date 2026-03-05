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

{/* NAV */}

<div className="max-w-7xl mx-auto flex justify-between items-center py-6 px-6">

<h1 className="text-xl font-semibold tracking-wide">
AuthorityOS
</h1>

<div className="text-[#d4ff00] font-medium">
AI Search Authority Scanner
</div>

</div>


{/* HERO */}

<section className="max-w-7xl mx-auto px-6 pt-16 pb-10 text-center">

<h2 className="text-5xl font-bold mb-6">

Will ChatGPT Recommend Your Business?

</h2>

<p className="text-gray-400 text-lg max-w-3xl mx-auto">

AuthorityOS analyzes how AI search engines interpret your website,
your entity authority, and whether your competitors are dominating
AI recommendations.

</p>

</section>


{/* SCAN CONTROL BAR */}

<section className="max-w-6xl mx-auto px-6 pb-20">

<div className="bg-[#111114] border border-[#1e1e21] rounded-xl p-6 shadow-lg">

<div className="grid md:grid-cols-4 gap-4">

{/* WEBSITE */}

<input
value={url}
onChange={e=>setUrl(e.target.value)}
placeholder="Enter website URL"
className="bg-[#1a1a1d] px-4 py-3 rounded-lg text-white border border-[#26262a]"
/>


{/* COMPETITOR */}

<input
value={competitor}
onChange={e=>setCompetitor(e.target.value)}
placeholder="Competitor (optional)"
className="bg-[#1a1a1d] px-4 py-3 rounded-lg text-white border border-[#26262a]"
/>


{/* SCAN TYPE */}

<select
value={scanType}
onChange={(e)=>setScanType(e.target.value)}
className="bg-[#1a1a1d] px-4 py-3 rounded-lg border border-[#26262a]"
>

<option value="light">Light Scan</option>
<option value="standard">Standard Scan</option>
<option value="deep">Deep Scan</option>

</select>


{/* BUTTON */}

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

<section className="max-w-6xl mx-auto px-6 pb-20">

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


{/* FEATURES */}

<section className="max-w-7xl mx-auto px-6 pb-24">

<h3 className="text-3xl font-bold mb-12 text-center">

Platform Capabilities

</h3>

<div className="grid md:grid-cols-3 gap-10">

<div className="bg-[#111114] p-6 rounded-xl border border-[#1e1e21]">

<h4 className="text-[#d4ff00] mb-2">

AI Authority Score

</h4>

<p className="text-gray-400">

Measure how much AI engines trust your website.

</p>

</div>


<div className="bg-[#111114] p-6 rounded-xl border border-[#1e1e21]">

<h4 className="text-[#d4ff00] mb-2">

Competitor AI Visibility

</h4>

<p className="text-gray-400">

See if competitors appear in AI answers more often.

</p>

</div>


<div className="bg-[#111114] p-6 rounded-xl border border-[#1e1e21]">

<h4 className="text-[#d4ff00] mb-2">

Schema + Entity Detection

</h4>

<p className="text-gray-400">

Analyze entity recognition and structured data signals.

</p>

</div>

</div>

</section>


{/* FOOTER */}

<footer className="text-center text-gray-500 pb-10">

Built by Uplift Digital

</footer>

</div>

)

}
