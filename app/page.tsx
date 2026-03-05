"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

/* ================= TYPES ================= */

type Scores = {
  authority: number;
  aio: number;
  geo: number;
  aeo: number;
  citation?: number;
};

type ScanResponse = {
  scores: Scores;
  recommendations?: any[];
  reasons?: Partial<Record<keyof Scores, string[]>>;
  entities?: string[];
  schemaTypes?: string[];
  pages?: Array<{
    url: string;
    title?: string;
    scores?: Partial<Scores>;
    issues?: string[];
    recommendations?: string[];
  }>;
  competitor?: {
    url: string;
    scores: Scores;
    entities?: string[];
    schemaTypes?: string[];
  };
};

/* ================= HELPERS ================= */

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function normalizeInputUrl(input: string) {
  const v = input.trim();
  if (!v) return "";
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  return `https://${v}`;
}

function stripTrailingSlash(u: string) {
  return u.endsWith("/") ? u.slice(0, -1) : u;
}

type Tier = "Critical" | "Needs Work" | "Strong";

function tierForScore(score: number): Tier {
  const v = clamp(score);
  if (v >= 75) return "Strong";
  if (v >= 45) return "Needs Work";
  return "Critical";
}

function tierMeta(tier: Tier) {
  if (tier === "Strong") {
    return {
      label: "Strong",
      ring: "rgba(34,197,94,0.4)",
      stroke: "#22c55e",
      text: "text-green-300",
      badge: "text-green-300 border-green-500/30 bg-green-500/10",
      bar: "bg-green-500",
    };
  }
  if (tier === "Needs Work") {
    return {
      label: "Needs Work",
      ring: "rgba(249,115,22,0.45)",
      stroke: "#f97316",
      text: "text-orange-300",
      badge: "text-orange-300 border-orange-500/30 bg-orange-500/10",
      bar: "bg-orange-500",
    };
  }
  return {
    label: "Critical",
    ring: "rgba(239,68,68,0.45)",
    stroke: "#ef4444",
    text: "text-red-300",
    badge: "text-red-300 border-red-500/30 bg-red-500/10",
    bar: "bg-red-500",
  };
}

/* ================= MAIN PAGE ================= */

export default function AuthorityOS() {

  const [url,setUrl]=useState("")
  const [competitor,setCompetitor]=useState("")
  const [depth,setDepth]=useState<"Light"|"Standard"|"Deep">("Standard")

  const [loading,setLoading]=useState(false)
  const [scanned,setScanned]=useState(false)
  const [error,setError]=useState<string|null>(null)

  const [data,setData]=useState<ScanResponse|null>(null)

  const normalizedUrl=useMemo(()=>normalizeInputUrl(url),[url])
  const normalizedCompetitor=useMemo(()=>normalizeInputUrl(competitor),[competitor])

  const runScan=async()=>{

    if(!normalizedUrl)return

    setLoading(true)
    setScanned(false)
    setError(null)

    try{

      const res=await fetch("/api/scan",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          url:normalizedUrl,
          competitor:normalizedCompetitor||undefined,
          depth
        })
      })

      const json=await res.json()

      if(!json?.scores){
        throw new Error(json?.error||"Scan failed")
      }

      setData(json)
      setScanned(true)

    }catch(e:any){

      setError(e?.message||"Scan failed")

    }finally{

      setLoading(false)

    }

  }

  return(

<div className="min-h-screen bg-[#070d18] text-white overflow-hidden relative">

{/* NAV */}

<div className="max-w-6xl mx-auto px-6 pt-8 flex items-center justify-between">
<div className="text-2xl font-extrabold text-[#eaff00]">AuthorityOS</div>
</div>

{/* HERO */}

<section className="max-w-6xl mx-auto px-6 pt-20 pb-14">

<h1 className="text-6xl font-extrabold leading-tight">

Will <span className="text-[#eaff00]">ChatGPT recommend</span> your business?

</h1>

<p className="mt-6 text-slate-300 text-lg max-w-xl">

Find out if AI search engines trust your website and whether your competitors are being recommended instead.

</p>

</section>

{/* SCAN */}

<section className="max-w-6xl mx-auto px-6 py-16">

<Card className="bg-[#111a2b]/80 border border-[#eaff00]/25 p-8">

<CardContent className="space-y-6">

<div className="grid md:grid-cols-3 gap-4">

<Input
placeholder="Your website"
value={url}
onChange={(e)=>setUrl(e.target.value)}
className="bg-[#070d18] border-[#eaff00]/35"
/>

<Input
placeholder="Competitor website"
value={competitor}
onChange={(e)=>setCompetitor(e.target.value)}
className="bg-[#070d18]"
/>

<Button
onClick={runScan}
disabled={loading}
className="bg-[#eaff00] text-black font-extrabold"
>
{loading?"Analyzing":"Scan Website"}
</Button>

</div>

{error&&<p className="text-red-300">{error}</p>}

</CardContent>

</Card>

</section>

{/* PRICING */}

<section className="max-w-6xl mx-auto px-6 pb-28">

<h2 className="text-3xl font-bold text-white mb-8">
Pricing
</h2>

<div className="grid md:grid-cols-4 gap-6">

<PricingCard
name="Free"
price="$0"
features={[
"1 scan"
]}
/>

<PricingCard
name="Starter"
price="$29/mo"
features={[
"10 scans per month"
]}
/>

<PricingCard
name="Pro"
price="$79/mo"
features={[
"Unlimited scans"
]}
/>

<PricingCard
name="Agency"
price="$199/mo"
features={[
"Unlimited scans",
"Export reports",
"Agency tools"
]}
/>

</div>

</section>

</div>

)

}

/* ================= PRICING ================= */

function PricingCard({name,price,features}:{name:string,price:string,features:string[]}){

return(

<Card className="bg-[#111a2b] border border-white/10">

<CardContent className="p-6">

<div className="text-xl font-bold text-white">{name}</div>

<div className="text-3xl font-extrabold text-[#eaff00] mt-2">
{price}
</div>

<ul className="mt-4 space-y-2 text-sm text-slate-300">

{features.map((f,i)=>(
<li key={i}>• {f}</li>
))}

</ul>

</CardContent>

</Card>

)

}
