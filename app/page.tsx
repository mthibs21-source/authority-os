"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Page() {

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

return (

<div className="min-h-screen bg-[#020617] text-white">

{/* NAV */}

<div className="border-b border-white/10">

<div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">

<div className="font-bold text-xl">
AuthorityOS
</div>

<div className="text-sm text-slate-400">
Will ChatGPT recommend your business?
</div>

</div>

</div>


{/* HERO */}

<section className="max-w-6xl mx-auto px-6 py-24">

<h1 className="text-5xl font-extrabold leading-tight">
Find out if AI search engines
<span className="text-[#eaff00]"> trust your website</span>
</h1>

<p className="mt-6 text-slate-300 text-lg max-w-xl">
Customers now ask ChatGPT and AI assistants for recommendations.  
AuthorityOS shows whether AI engines trust your website and recommend your business.
</p>

</section>


{/* PRODUCT EXPLANATION */}

<section className="max-w-6xl mx-auto px-6 pb-24">

<div className="grid lg:grid-cols-2 gap-16 items-center">

<div>

<h2 className="text-3xl font-bold">
How it works
</h2>

<div className="mt-8 space-y-6 text-slate-300">

<div>
<strong>1. Scan your website</strong><br/>
AuthorityOS analyzes your pages for AI search signals including schema, entities and answer structure.
</div>

<div>
<strong>2. Detect AI visibility</strong><br/>
See if AI engines can extract answers and trust your content enough to recommend it.
</div>

<div>
<strong>3. Fix what AI needs</strong><br/>
Get prioritized recommendations that increase AI visibility.
</div>

</div>

</div>

<div>

<Card className="bg-[#0f172a]/70 border border-white/10">
<CardContent className="p-6">

<div className="text-sm text-slate-400">
Example AI Prompt
</div>

<div className="mt-4 text-white font-semibold">
Best roofing company in Raleigh
</div>

<div className="mt-6 space-y-3 text-sm">

<div className="p-3 bg-white/5 rounded">
1. Triangle Roofing
</div>

<div className="p-3 bg-white/5 rounded">
2. Raleigh Roof Pros
</div>

<div className="p-3 bg-red-500/20 rounded text-red-300">
Your business not mentioned
</div>

</div>

</CardContent>
</Card>

</div>

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

<div className="font-semibold text-lg">
Local businesses
</div>

<p className="mt-3 text-sm text-slate-300">
See if AI assistants recommend your business when customers search for services in your city.
</p>

</CardContent>
</Card>


<Card className="bg-[#0f172a]/70 border border-white/10">
<CardContent className="p-6">

<div className="font-semibold text-lg">
SEO agencies
</div>

<p className="mt-3 text-sm text-slate-300">
Monitor AI visibility across clients and show measurable improvements in AI search authority.
</p>

</CardContent>
</Card>


<Card className="bg-[#0f172a]/70 border border-white/10">
<CardContent className="p-6">

<div className="font-semibold text-lg">
SaaS companies
</div>

<p className="mt-3 text-sm text-slate-300">
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

<div className="font-semibold">
Free
</div>

<div className="text-3xl mt-2">
$0
</div>

<p className="text-sm text-slate-400 mt-3">
One scan
</p>

</CardContent>
</Card>


<Card className="bg-[#0f172a]/70 border border-white/10">
<CardContent className="p-6">

<div className="font-semibold">
Starter
</div>

<div className="text-3xl mt-2">
$29
</div>

<p className="text-sm text-slate-400 mt-3">
10 scans per month
</p>

</CardContent>
</Card>


<Card className="bg-[#0f172a]/70 border border-white/10">
<CardContent className="p-6">

<div className="font-semibold">
Pro
</div>

<div className="text-3xl mt-2">
$79
</div>

<p className="text-sm text-slate-400 mt-3">
Unlimited scans
</p>

</CardContent>
</Card>


<Card className="bg-[#0f172a]/70 border border-white/10">
<CardContent className="p-6">

<div className="font-semibold">
Agency
</div>

<div className="text-3xl mt-2">
$199
</div>

<p className="text-sm text-slate-400 mt-3">
Unlimited scans + reports
</p>

</CardContent>
</Card>

</div>

</section>


{/* SCAN TOOL */}

<section id="scan" className="max-w-6xl mx-auto px-6 pb-24">

<Card className="bg-[#0f172a]/70 border border-white/10">

<CardContent className="p-8">

<div className="text-xl font-semibold mb-6">
Scan your website
</div>

<div className="flex gap-4">

<Input
placeholder="yourwebsite.com"
value={url}
onChange={(e)=>setUrl(e.target.value)}
/>

<Input
placeholder="competitor.com"
value={competitor}
onChange={(e)=>setCompetitor(e.target.value)}
/>

<Button onClick={runScan} disabled={loading}>
{loading ? "Scanning..." : "Run Scan"}
</Button>

</div>

</CardContent>

</Card>

</section>


{/* RESULTS */}

{results && (

<section className="max-w-6xl mx-auto px-6 pb-32">

<h2 className="text-3xl font-bold mb-10">
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
