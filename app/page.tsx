"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

type Scores = { authority: number; aio: number; geo: number; aeo: number };

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function normalizeInputUrl(input: string) {
  const v = input.trim();
  if (!v) return "";
  return v.startsWith("http://") || v.startsWith("https://") ? v : `https://${v}`;
}

function idForTitle(title: string) {
  let h = 2166136261;
  for (let i = 0; i < title.length; i++) {
    h ^= title.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `fix_${(h >>> 0).toString(16)}`;
}

type Tier = "Critical" | "Needs Work" | "Strong";

function tierForScore(score: number): Tier {
  const v = clamp(score);
  if (v >= 75) return "Strong";
  if (v >= 45) return "Needs Work";
  return "Critical";
}

function tierStyles(tier: Tier) {
  if (tier === "Strong") {
    return {
      stroke: "#22c55e",
      textClass: "text-green-300",
      badgeClass: "text-green-300 border-green-500/30 bg-green-500/10",
    };
  }
  if (tier === "Needs Work") {
    return {
      stroke: "#f97316",
      textClass: "text-orange-300",
      badgeClass: "text-orange-300 border-orange-500/30 bg-orange-500/10",
    };
  }
  return {
    stroke: "#ef4444",
    textClass: "text-red-300",
    badgeClass: "text-red-300 border-red-500/30 bg-red-500/10",
  };
}

export default function AuthorityOS() {
  const [url, setUrl] = useState("");
  const [competitor, setCompetitor] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);

  const [scores, setScores] = useState<Scores>({
    authority: 0,
    aio: 0,
    geo: 0,
    aeo: 0,
  });

  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const runScan = async () => {
    const normalizedUrl = normalizeInputUrl(url);
    if (!normalizedUrl) return;

    setLoading(true);
    setScanned(false);
    setError(null);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },

        // IMPORTANT: Only send URL so backend keeps working
        body: JSON.stringify({
          url: normalizedUrl
        }),
      });

      const data = await res.json();

      if (!data?.scores) throw new Error(data?.error || "Scan failed");

      setScores(data.scores);
      setRecommendations(data.recommendations || []);
      setScanned(true);
    } catch (err: any) {
      setError(err?.message || "Failed to scan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070d18] text-white overflow-hidden relative">

      <Hero />

      <section className="max-w-6xl mx-auto px-6 py-20">
        <Card className="bg-[#111a2b]/80 backdrop-blur border border-[#eaff00]/30 p-10">
          <CardContent className="space-y-6">

            <h2 className="text-3xl font-bold text-[#eaff00]">
              Run Real-Time Authority Scan
            </h2>

            <div className="flex flex-col md:flex-row gap-4">

              <Input
                placeholder="Enter website URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-[#070d18] border-[#eaff00]/40 text-white"
              />

              <Input
                placeholder="Competitor URL (optional)"
                value={competitor}
                onChange={(e) => setCompetitor(e.target.value)}
                className="bg-[#070d18] border-[#eaff00]/40 text-white"
              />

              <Button
                onClick={runScan}
                disabled={loading}
                className="bg-[#eaff00] hover:bg-[#d7f000] text-black font-bold px-8"
              >
                {loading ? "Analyzing..." : "Scan Website"}
              </Button>

            </div>

            {error && <p className="text-red-400">{error}</p>}

          </CardContent>
        </Card>
      </section>

      {scanned && (
        <section className="max-w-6xl mx-auto px-6 pb-48 space-y-16">
          <ScoreDashboard scores={scores} />
          <RecommendationsPanel items={recommendations} />
        </section>
      )}

      <StickyCTA />
    </div>
  );
}

function Hero() {
  const [score, setScore] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setScore((prev) => (prev >= 100 ? 5 : prev + 1));
    }, 180);

    return () => clearInterval(interval);
  }, []);

  const tier = tierForScore(score);
  const styles = tierStyles(tier);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <section className="relative max-w-6xl mx-auto px-6 pt-28 pb-24 grid lg:grid-cols-2 gap-16 items-center">

      <div>
        <h1 className="text-6xl font-extrabold leading-tight">
          Become the <span className="text-[#eaff00]">Authority</span> AI Engines Cite
        </h1>

        <p className="mt-6 text-slate-300 text-lg max-w-xl">
          AI search is replacing traditional SEO. This tool shows what fixes
          will make your site authoritative to AI engines.
        </p>
      </div>

      <div className="flex justify-center">

        <div className="relative">

          <svg width="220" height="220" className="-rotate-90">
            <circle
              cx="110"
              cy="110"
              r={radius}
              stroke="#1e293b"
              strokeWidth="16"
              fill="transparent"
            />

            <motion.circle
              cx="110"
              cy="110"
              r={radius}
              stroke={styles.stroke}
              strokeWidth="16"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />

          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">

            <div className={`text-5xl font-extrabold ${styles.textClass}`}>
              {score}
            </div>

            <div className="text-slate-400 text-sm">
              Live Authority Preview
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

function ScoreDashboard({ scores }: { scores: Scores }) {
  const items = [
    { label: "Authority", value: scores.authority },
    { label: "AIO", value: scores.aio },
    { label: "GEO", value: scores.geo },
    { label: "AEO", value: scores.aeo },
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
      {items.map((s) => (
        <Gauge key={s.label} label={s.label} value={s.value} />
      ))}
    </div>
  );
}

function Gauge({ label, value }: { label: string; value: number }) {
  const safe = clamp(value);
  const tier = tierForScore(safe);
  const styles = tierStyles(tier);

  return (
    <Card className="bg-[#111a2b] border border-[#eaff00]/20">

      <CardContent className="p-8 flex flex-col items-center gap-4">

        <div className={`text-4xl font-bold ${styles.textClass}`}>
          {safe}
        </div>

        <div className="text-sm text-slate-300">
          {label}
        </div>

      </CardContent>

    </Card>
  );
}

function RecommendationsPanel({ items }: any) {

  const rows = useMemo(() => {
    return items.map((title: string) => ({
      id: idForTitle(title),
      title,
      impact: Math.floor(Math.random() * 20) + 5,
    }));
  }, [items]);

  return (
    <div className="space-y-6">

      <h3 className="text-3xl font-bold text-[#eaff00]">
        Execution Plan
      </h3>

      {rows.map((r: any) => (
        <Card key={r.id} className="bg-[#111a2b] border border-[#eaff00]/20">

          <CardContent className="p-6">

            <h4 className="text-white font-semibold">
              {r.title}
            </h4>

          </CardContent>

        </Card>
      ))}

    </div>
  );
}

function StickyCTA() {
  return (
    <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center">

      <Button className="bg-[#eaff00] hover:bg-[#d7f000] text-black font-bold px-6 rounded-2xl">
        Run Another Scan
      </Button>

    </div>
  );
}
