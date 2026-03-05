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
  previewImage?: string;
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

function safeArray<T>(v: any): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [];
}

function depthToNumber(depth: "Light" | "Standard" | "Deep") {
  if (depth === "Light") return 6;
  if (depth === "Deep") return 20;
  return 10;
}

/* ================= MAIN PAGE ================= */

export default function AuthorityOS() {

  const [url, setUrl] = useState("");
  const [competitor, setCompetitor] = useState("");
  const [depth, setDepth] = useState<"Light" | "Standard" | "Deep">("Standard");

  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<ScanResponse | null>(null);

  const normalizedUrl = useMemo(() => normalizeInputUrl(url), [url]);
  const normalizedCompetitor = useMemo(() => normalizeInputUrl(competitor), [competitor]);

  const runScan = async () => {

    if (!normalizedUrl) return;

    setLoading(true);
    setScanned(false);
    setError(null);
    setData(null);

    try {

      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: normalizedUrl,
          competitor: competitor.trim() ? normalizedCompetitor : undefined,
          depth: depthToNumber(depth)
        }),
      });

      const json = await res.json();

      if (!res.ok || !json?.scores) {
        throw new Error(json?.error || "Scan failed");
      }

      setData(json);
      setScanned(true);

    } catch (e: any) {

      setError(e?.message || "Scan failed");

    } finally {

      setLoading(false);

    }

  };

  const recs = useMemo(
    () => safeArray<any>(data?.recommendations),
    [data?.recommendations]
  );

  return (

    <div className="min-h-screen bg-[#070d18] text-white overflow-hidden relative">

      <TopNav />

      <Hero onJump={() => document.getElementById("scan")?.scrollIntoView({ behavior: "smooth" })} />

      {/* SCAN */}
      <section id="scan" className="max-w-6xl mx-auto px-6 py-16">

        <Card className="bg-[#111a2b]/80 backdrop-blur border border-[#eaff00]/25 p-8 md:p-10">

          <CardContent className="space-y-6">

            <div className="grid md:grid-cols-3 gap-4">

              <Input
                placeholder="Your website, example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-[#070d18] border-[#eaff00]/35 text-white"
              />

              <Input
                placeholder="Competitor website optional"
                value={competitor}
                onChange={(e) => setCompetitor(e.target.value)}
                className="bg-[#070d18] border-[#eaff00]/20 text-white"
              />

              <Button
                onClick={runScan}
                disabled={loading}
                className="bg-[#eaff00] text-black font-extrabold"
              >
                {loading ? "Analyzing..." : "Scan Website"}
              </Button>

            </div>

            <div className="flex gap-3">

              {(["Light","Standard","Deep"] as const).map((d) => (

                <button
                  key={d}
                  onClick={() => setDepth(d)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${
                    depth === d
                      ? "border-[#eaff00]/50 bg-[#eaff00]/10 text-[#eaff00]"
                      : "border-white/10 bg-white/5 text-slate-300"
                  }`}
                >
                  {d}
                </button>

              ))}

            </div>

            {error && <p className="text-red-300">{error}</p>}

          </CardContent>

        </Card>

      </section>

      {/* RESULTS */}

      {scanned && data && (

        <section className="max-w-6xl mx-auto px-6 pb-28 space-y-12">

          <ScoreDashboard scores={data.scores} />

        </section>

      )}

    </div>

  );

}

/* ================= NAV ================= */

function TopNav() {
  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 flex items-center justify-between">
      <div className="text-2xl font-extrabold text-[#eaff00]">AuthorityOS</div>
    </div>
  );
}

/* ================= HERO ================= */

function Hero({ onJump }: { onJump: () => void }) {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-20 pb-14">
      <h1 className="text-6xl font-extrabold">
        Become the <span className="text-[#eaff00]">Authority</span> AI Engines Cite
      </h1>

      <p className="mt-6 text-slate-300 text-lg max-w-xl">
        AuthorityOS shows what to fix so AI search can classify your site and cite it.
      </p>

      <Button
        onClick={onJump}
        className="mt-8 bg-[#eaff00] text-black font-extrabold"
      >
        Run Authority Scan
      </Button>
    </section>
  );
}

/* ================= SCORE DASHBOARD ================= */

function ScoreDashboard({ scores }: { scores: Scores }) {

  const items = [
    { label:"Authority",value:scores.authority },
    { label:"AIO",value:scores.aio },
    { label:"GEO",value:scores.geo },
    { label:"AEO",value:scores.aeo }
  ];

  return (

    <div className="grid md:grid-cols-4 gap-6">

      {items.map((s) => (

        <Card key={s.label} className="bg-[#111a2b] border border-white/10">

          <CardContent className="p-7">

            <div className="text-sm text-slate-300">{s.label}</div>

            <div className="text-4xl font-extrabold text-[#eaff00] mt-2">
              {clamp(s.value)}
            </div>

          </CardContent>

        </Card>

      ))}

    </div>

  );

}
