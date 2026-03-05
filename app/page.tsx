"use client"

import { useState } from "react"

export default function Home() {

const [url,setUrl] = useState("")
const [loading,setLoading] = useState(false)
const [results,setResults] = useState<any>(null)

async function runScan(){

setLoading(true)

const res = await fetch("/api/scan",{
method:"POST",
body:JSON.stringify({url}),
headers:{
"Content-Type":"application/json"
}
})

const data = await res.json()

setResults(data)

setLoading(false)

}

async function checkout(){

const res = await fetch("/api/create-checkout-session",{
method:"POST"
})

const data = await res.json()

window.location.href = data.url

}

return (

<div className="min-h-screen bg-[#0b0b0d] text-white">

{/* NAV */}

<div className="max-w-6xl mx-auto flex justify-between items-center py-6 px-6">

<h1 className="text-xl font-semibold">AuthorityOS</h1>

<button
onClick={checkout}
className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg"
>
Start Pro
</button>

</div>


{/* HERO */}

<section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">

<div>

<h2 className="text-4xl font-bold leading-tight mb-6">
Dominate AI Search Rankings
</h2>

<p className="text-gray-300 mb-8">
AuthorityOS scans your website and shows how visible you are inside
AI search engines like ChatGPT, Gemini and Perplexity.
</p>

<div className="flex gap-3">

<input
value={url}
onChange={e=>setUrl(e.target.value)}
placeholder="enter website url"
className="px-4 py-3 rounded-lg text-black w-full"
/>

<button
onClick={runScan}
className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg"
>
Scan
</button>

</div>

</div>

{/* PRODUCT IMAGE */}

<div className="bg-[#141416] rounded-xl p-6 shadow-lg">

<div className="text-sm text-gray-400 mb-4">
Authority Scan Preview
</div>

<div className="space-y-3">

<div className="bg-[#1e1e21] p-3 rounded">
AI Authority Score: 74
</div>

<div className="bg-[#1e1e21] p-3 rounded">
AEO Score: 61
</div>

<div className="bg-[#1e1e21] p-3 rounded">
GEO Score: 58
</div>

<div className="bg-[#1e1e21] p-3 rounded">
Entity Authority: 66
</div>

</div>

</div>

</section>


{/* RESULTS */}

{results && (

<section className="max-w-5xl mx-auto px-6 pb-20">

<h3 className="text-2xl mb-6">Scan Results</h3>

<div className="grid grid-cols-2 md:grid-cols-4 gap-4">

{Object.entries(results.scores).map(([k,v])=>(
<div key={k} className="bg-[#141416] p-6 rounded-xl">

<div className="text-gray-400 text-sm">
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
1. Scan Your Website
</h4>

<p className="text-gray-400">
We crawl your pages and analyze content authority signals.
</p>

</div>

<div>

<h4 className="text-xl mb-2">
2. Measure AI Visibility
</h4>

<p className="text-gray-400">
See how well your site performs inside AI search engines.
</p>

</div>

<div>

<h4 className="text-xl mb-2">
3. Get Growth Opportunities
</h4>

<p className="text-gray-400">
Identify topics and authority gaps competitors dominate.
</p>

</div>

</div>

</section>


{/* USE CASES */}

<section className="bg-[#111114] py-20">

<div className="max-w-6xl mx-auto px-6">

<h3 className="text-3xl font-bold mb-12 text-center">
Who This Is For
</h3>

<div className="grid md:grid-cols-3 gap-10">

<div className="bg-[#18181b] p-6 rounded-xl">

<h4 className="text-lg mb-2">
SEO Agencies
</h4>

<p className="text-gray-400">
Audit client authority and prove AI visibility growth.
</p>

</div>

<div className="bg-[#18181b] p-6 rounded-xl">

<h4 className="text-lg mb-2">
SaaS Founders
</h4>

<p className="text-gray-400">
Understand how AI engines interpret your product pages.
</p>

</div>

<div className="bg-[#18181b] p-6 rounded-xl">

<h4 className="text-lg mb-2">
Local Businesses
</h4>

<p className="text-gray-400">
Win AI generated local search recommendations.
</p>

</div>

</div>

</div>

</section>


{/* PRICING */}

<section className="max-w-5xl mx-auto px-6 py-24 text-center">

<h3 className="text-3xl font-bold mb-6">
Simple Pricing
</h3>

<p className="text-gray-400 mb-10">
Start optimizing your AI search authority today.
</p>

<div className="bg-[#141416] p-10 rounded-xl inline-block">

<div className="text-4xl font-bold mb-4">
$49/mo
</div>

<button
onClick={checkout}
className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg"
>
Start Subscription
</button>

</div>

</section>

</div>

)

}
