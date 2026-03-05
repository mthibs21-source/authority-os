"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Page(){

const [url,setUrl] = useState("")
const [competitor,setCompetitor] = useState("")
const [loading,setLoading] = useState(false)
const [results,setResults] = useState<any>(null)

async function runScan(){

setLoading(true)

const res = await fetch("/api/scan",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({
url,
competitor
})
})

const data = await res.json()

setResults(data)
setLoading(false)

}

return(

<div className="min-h-screen bg-[#020617] text-white">

{/* NAVBAR */}

<div className="border-b border-white/10 bg-[#020617]/90 backdrop-blur">

<div className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center">

<div className="font-bold text-xl tracking-tight">
AuthorityOS
</div>

<div className="text-sm text-slate-300">
AI Search Visibility Scanner
</div>

</div>

</div>


{/* HERO */}

<section className="max-w-6xl mx-auto px-6 pt-24 pb-20">

<div className="grid lg:grid-cols-2 gap-16 items-center">

<div>

<h1 className="text-5xl font-extrabold leading-tight">
Will <span className="text-[#eaff00]">ChatGPT</span> recommend your business?
</h1>

<p className="mt-6 text-slate-300 text-lg">
Customers are increasingly asking AI engines like ChatGPT, Gemini, and Perplexity for recommendations.
</p>

<p className="mt-4 text-slate-300">
AuthorityOS scans your website and determines whether AI search engines trust your content, extract your answers, and recommend your company.
</p>

<div className="mt-10 flex gap-4">

<a href="#scan">

<Button className="bg-[#eaff00] text-black hover:bg-yellow-300">
Scan Your Website
</Button>

</a>

</div>

</div>


{/* VISUAL EXAMPLE */}

<div>

<Card className="bg-[#0f172a]/80 border border-white/10 shadow-xl">

<CardContent className="p-6">

<div className="text-sm text-slate-400">
Example AI Search Result
</div>

<div className="mt-3 font-semibold">
Prompt: Best roofing company in Raleigh
</div>

<div className="mt-5 space-y-3 text-sm">

<div className="bg-white/5 p-3 rounded">
1. Raleigh Roofing Experts
</div>

<div className="bg-white/5 p-3 rounded">
2. Triangle Roofing Solutions
</div>

<div className="bg-red-500/20 text-red-300 p-3 rounded">
Your company not mentioned
</div>

</div>

<div className="text-xs text-slate-400 mt-4">
AuthorityOS tracks prompts like this weekly and alerts you when AI starts recommending your business.
</div>

</CardContent>

</Card>

</div>

</div>

</section>


{/* FEATURES */}

<section className="max-w-6xl mx-auto px-6 pb-24">

<h2 className="text-3xl font-bold mb-10">
What AuthorityOS analyzes
</h2>

<div className="grid md:grid-cols-3 gap-6">

<Card className="bg-[#0f172a]/70 border border-white/10">
<CardContent className="p-6">

<div className="font-semibold text-lg">
AI Authority
</div>

<p className="mt-3 text-slate-300 text-sm">
Measures whether AI engines trust your website as a reliable source for answers and recommendations.
</p>

</CardContent>
</Card>


<Card className="bg-[#0f172a]/70 border border-white/10">
<CardContent className="p-6">

<div className="font-semibold text-lg">
Answer Extraction
</div>

<p className="mt-3 text-slate-300 text-sm">
Detects whether AI systems can easily extract structured answers and information from your content.
</p>

</CardContent>
</Card>


<Card className="bg-[#0f172a]/70 border border-white/10">
<CardContent className="p-6">

<div className="font-semibold text-lg">
Entity Signals
</div>

<p className="mt-3 text-slate-300 text-sm">
Analyzes whether your business entity is clearly understood by AI systems.
</p>

</CardContent>
</Card>


<Card className="bg-[#0f172a]/70 border border-white/10">
<CardContent className="p-6">

<div className="font-semibold text-lg">
Schema Detection
</div>

<p className="mt-3 text-slate-300 text-sm">
Checks for structured data like FAQ schema, organization schema and other signals AI uses.
</p>

</CardContent>
</Card>


<Card className="bg-[#0f172a]/70 border border-white/10">
<CardContent className="p-6">

<div className="font-semibold text-lg">
Content Extraction
</div>

<p className="mt-3 text-slate-300 text-sm">
Determines whether AI systems can easily parse and summarize your pages.
</p>

</CardContent>
</Card>


<Card className="bg-[#0f172a]/70 border border-white/10">
<CardContent className="p-6">

<div className="font-semibold text-lg">
Competitor Comparison
</div>

<p className="mt-3 text-slate-300 text-sm">
See how your competitors perform in AI search and why they might be recommended instead.
</p>

</CardContent>
</Card>

</div>

</section>


{/* USE CASES */}

<section className="max-w-6xl mx-auto px-6 pb-24">

<h2 className="text-3xl font-bold mb-10">
Who this is for
</h2>

<div className="grid md:grid-cols-3 gap-6">

<Card className="bg-[#0f172a]/70 border border-white/10">
<CardContent className="p-6">

<div className="font-semibold">
Local businesses
</div>

<p className="mt-3 text-slate-300 text-sm">
See if AI assistants recommend your company when customers search for services in your area.
</p>

</CardContent>
</Card>

<Card className="bg-[#0f172a]/70 border border-white/10">
<CardContent className="p-6">

<div className="font-semibold">
SEO agencies
</div>

<p className="mt-3 text-slate-300 text-sm">
Monitor AI visibility across multiple clients and show measurable improvements.
</p>

</CardContent>
</Card>

<Card className="bg-[#0f172a]/70 border border-white/10">
<CardContent className="p-6">

<div className="font-semibold">
SaaS companies
</div>

<p className="mt-3 text-slate-300 text-sm">
Understand whether AI engines recommend your product in software searches.
</p>

</CardContent>
</Card>

</div>

</section>


{/* PRICING */}

<section className="max-w-6xl mx-auto px-6 pb-24">

<h2 className="text-3xl font-bold mb-10">
Pricing
</h2>

<div className="grid md:grid-cols-4 gap-6">

<Card className="bg-[#0f172a]/70 border border-white/10">
<CardContent className="p-6">

<div className="font-semibold">Free</div>
<div className="text-3xl mt-2">$0</div>
<p className="text-sm text-slate-300 mt-3">One scan</p>

</CardContent>
</Card>

<Card className="bg-[#0f172a]/70 border border-white/10">
<CardContent className="p-6">

<div className="font-semibold">Starter</div>
<div className="text-3xl mt-2">$29</div>
<p className="text-sm text-slate-300 mt-3">10 scans per month</p>

</CardContent>
</Card>

<Card className="bg-[#0f172a]/70 border border-white/10">
<CardContent className="p-6">

<div className="font-semibold">Pro</div>
<div className="text-3xl mt-2">$79</div>
<p className="text-sm text-slate-300 mt-3">Unlimited scans</p>

</CardContent>
</Card>

<Card className="bg-[#0f172a]/70 border border-white/10">
<CardContent className="p-6">

<div className="font-semibold">Agency</div>
<div className="text-3xl mt-2">$199</div>
<p className="text-sm text-slate-300 mt-3">Unlimited scans + reporting</p>

</CardContent>
</Card>

</div>

</section>


{/* SCAN TOOL */}

<section id="scan" className="max-w-6xl mx-auto px-6 pb-32">

<Card className="bg-[#0f172a]/70 border border-white/10">

<CardContent className="p-8">

<div className="text-xl font-semibold mb-6">
Run AI Search Authority Scan
</div>

<div className="flex gap-4">

<Input
placeholder="yourwebsite.com"
value={url}
onChange={(e)=>setUrl(e.target.value)}
className="text-black"
/>

<Input
placeholder="competitor.com"
value={competitor}
onChange={(e)=>setCompetitor(e.target.value)}
className="text-black"
/>

<Button
onClick={runScan}
disabled={loading}
className="bg-[#eaff00] text-black hover:bg-yellow-300"
>

{loading ? "Scanning..." : "Run Scan"}

</Button>

</div>

</CardContent>

</Card>

</section>


{/* RESULTS */}

{results && (

<section className="max-w-6xl mx-auto px-6 pb-24">

<h2 className="text-3xl font-bold mb-6">
Your Results
</h2>

<pre className="bg-black/40 p-6 rounded text-sm overflow-x-auto">
{JSON.stringify(results,null,2)}
</pre>

</section>

)}

</div>

)

}
