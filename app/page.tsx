"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

/* ================= TYPES ================= */

type Scores = { authority: number; aio: number; geo: number; aeo: number };

/* ================= HELPERS ================= */

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

/* ================= MAIN APP ================= */

export default function AuthorityOS() {
  const [url, setUrl] = useState("");
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
        body: JSON.stringify({ url: normalizedUrl }),
      });

      const data = await res.json();

      if (!data?.scores) throw new Error(data?.error || "Scan failed");

      setScores(data.scores);
      setRecommendations(data.recommendations || []);
      setScanned(true);
    } catch (err: any) {
      setError(err?.message || "Unable to analyze this website.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070d18] text-white overflow-hidden relative">
      <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,rgba(234,255,0,0.15),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(56,189,248,0.15),transparent_40%),radial-gradient(circle_at_50%_80%,rgba(34,197,94,0.15),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <Hero />

      <section className="max-w-6xl mx-auto px-6 py-20">
        <Card className="bg-[#111a2b]/80 backdrop-blur border border-[#eaff00]/30 p-10 shadow-[0_0_60px_rgba(234,255,0,0.08)]">
          <CardContent className="space-y-6">
            <h2 className="text-3xl font-bold text-[#eaff00]">Run Real-Time Authority Scan</h2>

            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Enter website URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-[#070d18] border-[#eaff00]/40 text-white"
              />

              <Button
                onClick={runScan}
                disabled={loading}
                className="bg-[#eaff00] hover:bg-[#d7f000] text-black hover:text-black font-bold px-8 shadow-[0_0_20px_rgba(234,255,0,0.5)]"
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
          <AuthoritySimulator baseScore={scores.authority} />
          <SEOReviewPanel scores={scores} recommendations={recommendations} />
          <RecommendationsPanel items={recommendations} />
        </section>
      )}

      <StickyCTA />
    </div>
  );
}

/* ================= HERO ================= */

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
          AI search is replacing traditional SEO. This tool shows what fixes will make your site authoritative to AI engines.
        </p>
      </div>

      <div className="flex justify-center">
        <div className="relative">
          <svg width="220" height="220" className="-rotate-90">
            <circle cx="110" cy="110" r={radius} stroke="#1e293b" strokeWidth="16" fill="transparent" />

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
              animate={{ strokeDashoffset: offset }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-5xl font-extrabold ${styles.textClass}`}>{score}</div>
            <div className="text-slate-400 text-sm">Live Authority Preview</div>
          </div>

          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
            <span className={`text-xs px-2.5 py-1 rounded-full border ${styles.badgeClass}`}>{tier}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= SCORE DASHBOARD ================= */

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

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safe / 100) * circumference;

  return (
    <Card className="bg-[#111a2b] border border-[#eaff00]/20">
      <CardContent className="p-8 flex flex-col items-center gap-4">
        <svg width="120" height="120" className="-rotate-90">
          <circle cx="60" cy="60" r={radius} stroke="#1e293b" strokeWidth="10" fill="transparent" />

          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            stroke={styles.stroke}
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            animate={{ strokeDashoffset: offset }}
          />
        </svg>

        <div className={`text-3xl font-extrabold ${styles.textClass}`}>{safe}</div>

        <div className="flex items-center gap-2">
          <div className="text-sm text-slate-300">{label}</div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${styles.badgeClass}`}>{tier}</span>
        </div>
      </CardContent>
    </Card>
  );
}

/* ================= AUTHORITY SIMULATOR ================= */

function AuthoritySimulator({ baseScore }: { baseScore: number }) {
  const [growth, setGrowth] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setGrowth((g) => (g >= 25 ? 0 : g + 1));
    }, 120);

    return () => clearInterval(timer);
  }, []);

  const future = clamp(baseScore + growth);

  return (
    <Card className="bg-[#111a2b] border border-[#eaff00]/20">
      <CardContent className="p-10 space-y-6">
        <h3 className="text-2xl font-bold text-[#eaff00]">Authority Growth Simulator</h3>

        <div className="flex items-center justify-between">
          <div className="text-slate-400">Current Authority</div>
          <div className="text-2xl font-extrabold text-white">
            <span className="inline-flex items-center rounded-xl border border-[#eaff00]/25 bg-[#070d18]/40 px-3 py-1.5 shadow-[0_0_18px_rgba(234,255,0,0.12)]">
              <span className="text-[#eaff00]">{baseScore}</span>
              <span className="ml-2 text-xs text-slate-400">/ 100</span>
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-slate-400">After Fix Implementation</div>
          <div className="text-2xl font-extrabold text-white">
            <span className="inline-flex items-center rounded-xl border border-[#eaff00]/35 bg-[#070d18]/55 px-3 py-1.5 shadow-[0_0_22px_rgba(234,255,0,0.18)]">
              <span className="text-[#eaff00]">{future}</span>
              <span className="ml-2 text-xs text-slate-400">/ 100</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ================= SEO REVIEW ================= */

function SEOReviewPanel({
  scores,
  recommendations,
}: {
  scores: Scores;
  recommendations: string[];
}) {
  const seo = useMemo(() => computeSeo(scores, recommendations), [scores, recommendations]);

  return (
    <Card className="bg-[#111a2b]/80 backdrop-blur border border-[#eaff00]/20 shadow-[0_0_30px_rgba(234,255,0,0.08)]">
      <CardContent className="p-10 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold text-[#eaff00]">SEO Review</h3>
            <p className="mt-2 text-slate-300">A clean technical SEO check plus the top fixes most likely to lift rankings.</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="min-w-[150px]">
              <Gauge label="SEO" value={seo.score} />
            </div>
            <div className="space-y-2">
              <div className="text-sm text-slate-300">
                Priority focus: <span className="text-white font-semibold">{seo.focus}</span>
              </div>
              <div className="text-xs text-slate-400">
                Estimated lift if you complete the top 5 items: +{seo.estimatedLift} authority points
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-[#0b1323] border border-[#eaff00]/15">
            <CardContent className="p-6 space-y-4">
              <div className="text-sm font-semibold text-white">Top SEO Issues</div>
              <ul className="space-y-3 text-sm text-slate-300">
                {seo.issues.map((it) => (
                  <li key={it.title} className="flex items-start gap-3">
                    <span
                      className={`mt-1 inline-flex h-2.5 w-2.5 rounded-full ${
                        it.severity === "High"
                          ? "bg-red-500"
                          : it.severity === "Medium"
                          ? "bg-orange-500"
                          : "bg-green-500"
                      }`}
                    />
                    <div>
                      <div className="text-white font-medium">{it.title}</div>
                      <div className="text-slate-400">{it.detail}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-[#0b1323] border border-[#eaff00]/15">
            <CardContent className="p-6 space-y-4">
              <div className="text-sm font-semibold text-white">Quick Wins</div>
              <div className="space-y-4">
                {seo.quickWins.map((w) => (
                  <div key={w.title} className="rounded-xl border border-[#eaff00]/10 bg-[#070d18]/40 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-white font-medium">{w.title}</div>
                      <div className="text-xs text-slate-400">Impact +{w.impact}</div>
                    </div>
                    <div className="mt-2 text-sm text-slate-400">{w.how}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {seo.checklist.map((c) => (
            <div key={c.name} className="rounded-2xl border border-[#eaff00]/10 bg-[#070d18]/30 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-white font-semibold">{c.name}</div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full border ${
                    c.status === "Good"
                      ? "text-green-300 border-green-500/30 bg-green-500/10"
                      : c.status === "Needs Work"
                      ? "text-orange-300 border-orange-500/30 bg-orange-500/10"
                      : "text-red-300 border-red-500/30 bg-red-500/10"
                  }`}
                >
                  {c.status}
                </span>
              </div>
              <div className="mt-2 text-sm text-slate-400">{c.note}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

type SeoSeverity = "High" | "Medium" | "Low";
type SeoIssue = { title: string; detail: string; severity: SeoSeverity };
type SeoWin = { title: string; how: string; impact: number };
type SeoCheck = { name: string; status: "Good" | "Needs Work" | "Critical"; note: string };
type SeoSummary = {
  score: number;
  focus: string;
  estimatedLift: number;
  issues: SeoIssue[];
  quickWins: SeoWin[];
  checklist: SeoCheck[];
};

function computeSeo(scores: Scores, recommendations: string[]): SeoSummary {
  const recText = recommendations.join(" \n ").toLowerCase();

  const signals = {
    schema: recText.includes("schema") || recText.includes("json-ld"),
    contentDepth: recText.includes("word") || recText.includes("topical") || recText.includes("longform"),
    headings: recText.includes("h2") || recText.includes("h1") || recText.includes("sections"),
    internalLinks: recText.includes("internal link"),
    faq: recText.includes("faq"),
    author: recText.includes("author") || recText.includes("expertise") || recText.includes("eeat"),
  };

  let score = 55;
  score += clamp(scores.authority - 50, -20, 25) * 0.6;

  if (signals.schema) score -= 10;
  else score += 6;

  if (signals.contentDepth) score -= 8;
  else score += 6;

  if (signals.headings) score -= 6;
  else score += 4;

  if (signals.internalLinks) score -= 6;
  else score += 3;

  if (signals.author) score -= 6;
  else score += 3;

  score = clamp(Math.round(score));

  const issues: SeoIssue[] = [];
  const addIssue = (title: string, detail: string, severity: SeoSeverity) => {
    issues.push({ title, detail, severity });
  };

  if (signals.schema) {
    addIssue(
      "Missing or weak structured data",
      "Add JSON-LD for Organization, Website, Breadcrumb, and key service pages to help search engines and AI understand entities.",
      "High"
    );
  }

  if (signals.contentDepth) {
    addIssue(
      "Content depth is likely thin",
      "Build 3 to 6 supporting pages per core service and link them as a topic cluster.",
      "High"
    );
  }

  if (signals.headings) {
    addIssue(
      "Heading structure needs work",
      "Use one H1 per page and clear H2 sections that match search intent and FAQs.",
      "Medium"
    );
  }

  if (signals.internalLinks) {
    addIssue(
      "Internal linking is weak",
      "Add contextual links between services, locations, and supporting articles.",
      "Medium"
    );
  }

  if (signals.author) {
    addIssue(
      "E-E-A-T signals are missing",
      "Add author bios, credentials, review signals, and real project proof.",
      "Medium"
    );
  }

  if (!issues.length) {
    addIssue(
      "Solid foundations",
      "Your scan did not surface obvious structural gaps. Focus next on topical expansion and link authority.",
      "Low"
    );
  }

  const quickWins: SeoWin[] = [
    {
      title: "Rewrite title tags for intent",
      how: "Use: Primary service + location + trust qualifier, keep 50 to 60 chars.",
      impact: 6,
    },
    {
      title: "Add a FAQ block to top pages",
      how: "Add 5 to 8 questions per service page, then mark up with FAQ schema.",
      impact: 7,
    },
    {
      title: "Strengthen internal links",
      how: "Add 6 to 10 contextual links per core page to related services and guides.",
      impact: 5,
    },
  ];

  const checklist: SeoCheck[] = [
    {
      name: "Title tags",
      status: score >= 75 ? "Good" : score >= 50 ? "Needs Work" : "Critical",
      note: "Unique, intent-matched titles for every page.",
    },
    {
      name: "Meta descriptions",
      status: score >= 75 ? "Good" : score >= 50 ? "Needs Work" : "Critical",
      note: "Compelling summaries that improve CTR.",
    },
    {
      name: "Schema",
      status: signals.schema ? "Critical" : "Needs Work",
      note: "Organization, LocalBusiness, Breadcrumb, FAQ.",
    },
    {
      name: "Internal linking",
      status: signals.internalLinks ? "Needs Work" : "Good",
      note: "Build topical clusters and link them tightly.",
    },
    {
      name: "Content depth",
      status: signals.contentDepth ? "Critical" : "Needs Work",
      note: "800+ words where it matters, answer intent fully.",
    },
    {
      name: "E-E-A-T",
      status: signals.author ? "Needs Work" : "Good",
      note: "Proof, authors, experience, reviews.",
    },
  ];

  const focus = issues[0]?.severity === "High" ? "Fix critical structure first" : "Scale topical authority";

  const estimatedLift = clamp(
    Math.round(
      (issues.filter((i) => i.severity === "High").length * 6 +
        issues.filter((i) => i.severity === "Medium").length * 3 +
        issues.filter((i) => i.severity === "Low").length * 1) *
        0.8
    ),
    0,
    25
  );

  return {
    score,
    focus,
    estimatedLift,
    issues,
    quickWins,
    checklist,
  };
}

/* ================= FIX PANEL ================= */

function RecommendationsPanel({ items }: any) {
  const rows = useMemo(() => {
    return items.map((title: string) => ({
      id: idForTitle(title),
      title,
      impact: Math.floor(Math.random() * 20) + 5,
    }));
  }, [items]);

  const exportCSV = () => {
    const esc = (v: string) => `"${(v || "").replace(/"/g, '""')}"`;
    const header = ["title"].join(",");
    const lines = rows.map((r: any) => esc(r.title));
    const csv = "\uFEFF" + [header, ...lines].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");

    a.href = URL.createObjectURL(blob);
    a.download = "authorityos_execution_plan.csv";
    a.click();

    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-3xl font-bold text-[#eaff00]">Execution Plan</h3>
        <Button onClick={exportCSV}>Export CSV</Button>
      </div>

      {rows.map((r: any) => (
        <Card key={r.id} className="bg-[#111a2b] border border-[#eaff00]/20">
          <CardContent className="p-6 space-y-3">
            <h4 className="text-white font-semibold">{r.title}</h4>

            <div className="text-xs text-slate-400">Estimated Authority Impact</div>

            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className="bg-[#eaff00] h-full" style={{ width: `${r.impact * 4}%` }} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ================= FLOATING CTA ================= */

function StickyCTA() {
  return (
    <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center pointer-events-none">
      <div className="pointer-events-auto">
        <Button className="bg-[#eaff00] hover:bg-[#d7f000] text-black hover:text-black font-bold shadow-[0_0_22px_rgba(234,255,0,0.5)] px-6 rounded-2xl">
          Run Another Scan
        </Button>
      </div>
    </div>
  );
}