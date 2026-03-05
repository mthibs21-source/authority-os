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

function scoreHint(label: string, tier: Tier) {
  if (label === "Authority") {
    if (tier === "Strong") return "Your site is well understood and well supported by clear structure and trust signals.";
    if (tier === "Needs Work") return "You are partially understood, but missing key signals that help AI cite you confidently.";
    return "Low authority signals. AI engines struggle to trust, classify, and cite your pages.";
  }

  if (label === "AIO") {
    if (tier === "Strong") return "Your content is formatted and structured in a way AI can reuse safely.";
    if (tier === "Needs Work") return "Some AI friendly formatting exists, but answers are not consistently extractable.";
    return "AI cannot easily extract answers, entities, and supporting proof from your pages.";
  }

  if (label === "GEO") {
    if (tier === "Strong") return "Good entity coverage and content clustering helps your site rank across topic maps.";
    if (tier === "Needs Work") return "Your topical clusters are incomplete, coverage is uneven, internal links can be stronger.";
    return "Weak topical authority map. You need clusters, internal linking, and better entity signals.";
  }

  if (label === "AEO") {
    if (tier === "Strong") return "Strong question answering format, FAQs, schema, and scannable structure.";
    if (tier === "Needs Work") return "Some answers exist but missing FAQ depth, schema, or clean intent based sections.";
    return "Weak answer engine signals. Add FAQ blocks, intent headings, and structured answers.";
  }

  return "Improve signals to increase AI confidence.";
}

function safeArray<T>(v: any): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [];
}

function buildPreviewCandidates(url: string) {
  const u = stripTrailingSlash(normalizeInputUrl(url));
  const encoded = encodeURIComponent(u);

  return [
    // Thum (works often, but can fail on prod sometimes)
    `https://image.thum.io/get/width/1400/${u}`,
    `https://image.thum.io/get/width/1400/noanimate/${u}`,

    // WordPress mShots fallback (slow but reliable)
    `https://s.wordpress.com/mshots/v1/${encoded}?w=1400`,

    // Another thum pattern using encoded URL (sometimes helps)
    `https://image.thum.io/get/width/1400/${encoded}`,
  ];
}

function normalizeRecommendation(item: any) {
  // If API returns strings, we transform into richer cards.
  if (typeof item === "string") {
    const t = item.toLowerCase();
    const severity: Tier =
      t.includes("critical") || t.includes("missing") || t.includes("error") ? "Critical" : t.includes("improve") || t.includes("add") ? "Needs Work" : "Needs Work";

    const why =
      t.includes("schema")
        ? "Helps search engines and AI understand your business, pages, and relationships."
        : t.includes("internal link")
        ? "Improves crawling, topical authority, and distributes page authority."
        : t.includes("faq")
        ? "Creates extractable answers and boosts AEO style signals."
        : t.includes("title")
        ? "Better intent matching increases ranking and CTR."
        : "Boosts clarity and trust signals for AI and search engines.";

    const how =
      t.includes("schema")
        ? "Add JSON-LD (Organization, Website, Breadcrumb, FAQ, Service)."
        : t.includes("internal link")
        ? "Add 6 to 10 contextual links per core page to related services and guides."
        : t.includes("faq")
        ? "Add 5 to 8 FAQs per core page, then mark up with FAQ schema."
        : t.includes("title")
        ? "Use: Primary keyword, location, proof qualifier. Keep 50 to 60 chars."
        : "Improve structure, clarity, and proof on the page.";

    return {
      title: item,
      severity,
      why,
      how,
      impact: severity === "Critical" ? 9 : 6,
    };
  }

  // If API already returns objects, keep what it has.
  const severity: Tier = item?.severity || item?.tier || "Needs Work";
  return {
    title: item?.title || item?.name || "Recommendation",
    severity,
    why: item?.why || item?.reason || "Improves site clarity and trust.",
    how: item?.how || item?.fix || "Apply the suggested change.",
    impact: typeof item?.impact === "number" ? item.impact : severity === "Critical" ? 9 : 6,
  };
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
          competitor: normalizedCompetitor || undefined,
          depth,
        }),
      });

      const json = await res.json();

      if (!json?.scores) {
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

  const recs = useMemo(() => safeArray<any>(data?.recommendations).map(normalizeRecommendation), [data?.recommendations]);

  return (
    <div className="min-h-screen bg-[#070d18] text-white overflow-hidden relative">
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,rgba(234,255,0,0.16),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(56,189,248,0.14),transparent_40%),radial-gradient(circle_at_55%_85%,rgba(34,197,94,0.14),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <TopNav />

      <Hero onJump={() => document.getElementById("scan")?.scrollIntoView({ behavior: "smooth" })} />

      {/* SCAN */}
      <section id="scan" className="max-w-6xl mx-auto px-6 py-16">
        <Card className="bg-[#111a2b]/80 backdrop-blur border border-[#eaff00]/25 p-8 md:p-10 shadow-[0_0_70px_rgba(234,255,0,0.08)]">
          <CardContent className="space-y-6">
            <div className="flex items-start justify-between gap-6 flex-col md:flex-row">
              <div>
                <h2 className="text-3xl font-bold text-[#eaff00]">Run Real Time Authority Scan</h2>
                <p className="mt-2 text-slate-300 max-w-2xl">
                  You will get a scorecard, a clear diagnosis (Critical, Needs Work, Strong), a competitor benchmark, and a prioritized execution plan.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">Crawl Depth</span>
                <div className="flex gap-2">
                  {(["Light", "Standard", "Deep"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDepth(d)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition ${
                        depth === d
                          ? "border-[#eaff00]/50 bg-[#eaff00]/10 text-[#eaff00]"
                          : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <Input
                placeholder="Your website, example, example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-[#070d18] border-[#eaff00]/35 text-white placeholder:text-slate-500 focus-visible:ring-[#eaff00]/35"
              />

              <Input
                placeholder="Competitor website, optional"
                value={competitor}
                onChange={(e) => setCompetitor(e.target.value)}
                className="bg-[#070d18] border-[#eaff00]/20 text-white placeholder:text-slate-500 focus-visible:ring-[#eaff00]/35"
              />

              <Button
                onClick={runScan}
                disabled={loading}
                className="bg-[#eaff00] text-black hover:text-black font-extrabold shadow-[0_0_26px_rgba(234,255,0,0.55)] hover:shadow-[0_0_40px_rgba(234,255,0,0.65)] hover:bg-[#f2ff4d] transition"
              >
                {loading ? "Analyzing..." : "Scan Website"}
              </Button>
            </div>

            {error && <p className="text-red-300">{error}</p>}
          </CardContent>
        </Card>
      </section>

      {/* PRE SCAN VALUE BLOCKS (LANDING POP) */}
      {!scanned && (
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="grid md:grid-cols-3 gap-6">
            <ValueCard
              title="Know exactly what AI does not trust"
              desc="We surface missing entity signals, weak page structure, and thin proof, the reasons AI does not cite you."
            />
            <ValueCard
              title="Get a prioritized execution plan"
              desc="Not a generic audit. You get the highest impact fixes first, with what to do and why it matters."
            />
            <ValueCard
              title="Benchmark against a competitor"
              desc="See where they win, why they win, and which pages to improve to close the gap."
            />
          </div>
        </section>
      )}

      {/* RESULTS */}
      {scanned && data && (
        <section className="max-w-6xl mx-auto px-6 pb-28 space-y-12">
          <ScoreDashboard scores={data.scores} reasons={data.reasons} />

          <div className="grid lg:grid-cols-2 gap-8">
            <WebsitePreview url={normalizedUrl} />
            <EntitySchemaPanel entities={safeArray<string>(data.entities)} schemaTypes={safeArray<string>(data.schemaTypes)} />
          </div>

          <CompetitorPanel youUrl={normalizedUrl} competitorUrl={data.competitor?.url} you={data.scores} comp={data.competitor?.scores} />

          <div className="grid lg:grid-cols-2 gap-8">
            <PageInsightsPanel pages={safeArray<any>(data.pages)} />
            <RecommendationsPanel recommendations={recs} />
          </div>
        </section>
      )}

      <footer className="max-w-6xl mx-auto px-6 pb-10 pt-6 text-sm text-slate-500 flex items-center justify-end">
        Built by Uplift Digital
      </footer>
    </div>
  );
}

/* ================= NAV ================= */

function TopNav() {
  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 flex items-center justify-between">
      <div className="text-2xl font-extrabold text-[#eaff00]">AuthorityOS</div>
      <div className="text-sm text-slate-400">Built by Uplift Digital</div>
    </div>
  );
}

/* ================= HERO ================= */

function Hero({ onJump }: { onJump: () => void }) {
  return (
    <section className="relative max-w-6xl mx-auto px-6 pt-20 pb-14 grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <h1 className="text-6xl font-extrabold leading-tight">
          Become the <span className="text-[#eaff00]">Authority</span> AI Engines Cite
        </h1>

        <p className="mt-6 text-slate-300 text-lg max-w-xl">
          Traditional SEO is not enough. AuthorityOS shows what to fix so AI search can classify your site, trust it, and cite it.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <HeroPill label="Entity detection" />
          <HeroPill label="Schema coverage" />
          <HeroPill label="Citation likelihood" />
          <HeroPill label="Competitor benchmark" />
        </div>

        <div className="mt-10 flex items-center gap-4">
          <Button
            onClick={onJump}
            className="bg-[#eaff00] text-black hover:text-black font-extrabold px-6 shadow-[0_0_26px_rgba(234,255,0,0.5)] hover:bg-[#f2ff4d] transition"
          >
            Run Authority Scan
          </Button>

          <a
            href="#scan"
            onClick={(e) => {
              e.preventDefault();
              onJump();
            }}
            className="text-slate-300 hover:text-white transition text-sm underline underline-offset-4"
          >
            See what you will get
          </a>
        </div>
      </div>

      {/* HERO VISUAL */}
      <div className="relative">
        <div className="absolute -inset-6 rounded-[32px] bg-[#eaff00]/10 blur-2xl" />
        <div className="relative rounded-[28px] border border-[#eaff00]/20 bg-[#0b1323]/70 backdrop-blur p-6 shadow-[0_0_60px_rgba(234,255,0,0.08)]">
          <div className="text-sm text-slate-300">What happens after you scan</div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <MiniStat title="Scorecard" desc="Strong, Needs Work, Critical" />
            <MiniStat title="Proof gaps" desc="What AI does not trust" />
            <MiniStat title="Page insights" desc="Which URLs to fix first" />
            <MiniStat title="Execution plan" desc="High impact recommendations" />
          </div>

          <motion.div
            className="mt-6 rounded-2xl border border-white/10 bg-[#070d18]/50 p-5"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-xs text-slate-400">Example outcome</div>
            <div className="mt-2 text-white font-semibold">Add Organization schema, tighten internal linking, expand service FAQs.</div>
            <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-[68%] bg-[#eaff00]" />
            </div>
            <div className="mt-2 text-xs text-slate-400">Estimated authority lift: +14 points</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HeroPill({ label }: { label: string }) {
  return (
    <span className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 transition">
      {label}
    </span>
  );
}

function MiniStat({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#070d18]/40 p-4">
      <div className="text-white font-semibold">{title}</div>
      <div className="mt-1 text-sm text-slate-400">{desc}</div>
    </div>
  );
}

/* ================= VALUE CARDS ================= */

function ValueCard({ title, desc }: { title: string; desc: string }) {
  return (
    <Card className="bg-[#111a2b]/70 backdrop-blur border border-white/10 hover:border-[#eaff00]/25 transition">
      <CardContent className="p-7">
        <div className="text-white font-semibold text-lg">{title}</div>
        <div className="mt-2 text-slate-300">{desc}</div>
      </CardContent>
    </Card>
  );
}

/* ================= SCORE DASHBOARD ================= */

function ScoreDashboard({ scores, reasons }: { scores: Scores; reasons?: any }) {
  const items = [
    { label: "Authority", value: scores.authority },
    { label: "AIO", value: scores.aio },
    { label: "GEO", value: scores.geo },
    { label: "AEO", value: scores.aeo },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold text-white">Your Results</h2>
        <p className="mt-2 text-slate-300">Clear tiers, reasons, and a prioritized plan to improve your AI search authority.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((s) => (
          <ScoreCard key={s.label} label={s.label} value={s.value} reasons={reasons?.[s.label?.toLowerCase?.()] || reasons?.[s.label] || reasons?.[s.label as any]} />
        ))}
      </div>
    </div>
  );
}

function ScoreCard({ label, value, reasons }: { label: string; value: number; reasons?: string[] }) {
  const safe = clamp(value);
  const tier = tierForScore(safe);
  const meta = tierMeta(tier);

  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safe / 100) * circumference;

  const reasonList = safeArray<string>(reasons);
  const defaultHint = scoreHint(label, tier);

  return (
    <Card className="bg-[#111a2b] border border-white/10 hover:border-[#eaff00]/25 transition">
      <CardContent className="p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-300">{label}</div>
          <span className={`text-[10px] px-2.5 py-1 rounded-full border ${meta.badge}`}>{meta.label}</span>
        </div>

        <div className="flex items-center gap-5">
          <svg width="112" height="112" className="-rotate-90">
            <circle cx="56" cy="56" r={radius} stroke="#1e293b" strokeWidth="12" fill="transparent" />
            <circle
              cx="56"
              cy="56"
              r={radius}
              stroke={meta.stroke}
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>

          <div>
            <div className={`text-4xl font-extrabold ${meta.text}`}>{safe}</div>
            <div className="text-xs text-slate-400">out of 100</div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#070d18]/35 p-4">
          <div className="text-xs text-slate-400">What this means</div>
          <div className="mt-1 text-sm text-slate-200">{defaultHint}</div>

          {(reasonList.length > 0) && (
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {reasonList.slice(0, 3).map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-white/30" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div className={`h-full ${meta.bar}`} style={{ width: `${safe}%` }} />
        </div>
      </CardContent>
    </Card>
  );
}

/* ================= WEBSITE PREVIEW ================= */

function WebsitePreview({ url }: { url: string }) {
  const candidates = useMemo(() => buildPreviewCandidates(url), [url]);
  const [srcIndex, setSrcIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSrcIndex(0);
    setFailed(false);
  }, [url]);

  const src = candidates[srcIndex];

  return (
    <Card className="bg-[#111a2b]/80 backdrop-blur border border-white/10">
      <CardContent className="p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-white">Website Preview</div>
          <a href={url} target="_blank" rel="noreferrer" className="text-xs text-slate-300 hover:text-white transition underline underline-offset-4">
            Open site
          </a>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#070d18]/30 overflow-hidden">
          {!failed ? (
            <img
              src={src}
              alt="Website preview"
              className="w-full h-[280px] object-cover"
              onError={() => {
                if (srcIndex < candidates.length - 1) {
                  setSrcIndex((i) => i + 1);
                } else {
                  setFailed(true);
                }
              }}
            />
          ) : (
            <div className="p-8">
              <div className="text-white font-semibold">Preview unavailable</div>
              <div className="mt-2 text-slate-300 text-sm">
                Screenshot providers sometimes block requests on production deployments. Your scan is still valid.
              </div>
              <div className="mt-4">
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border border-[#eaff00]/30 bg-[#eaff00]/10 px-4 py-2 text-sm text-[#eaff00] hover:bg-[#eaff00]/15 transition"
                >
                  Open your site in a new tab
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-slate-400">
          If the preview ever fails, we automatically retry multiple providers and fall back gracefully.
        </div>
      </CardContent>
    </Card>
  );
}

/* ================= ENTITY + SCHEMA ================= */

function EntitySchemaPanel({ entities, schemaTypes }: { entities: string[]; schemaTypes: string[] }) {
  const hasEntities = entities.length > 0;
  const hasSchema = schemaTypes.length > 0;

  return (
    <Card className="bg-[#111a2b]/80 backdrop-blur border border-white/10">
      <CardContent className="p-7 space-y-6">
        <div>
          <div className="text-xl font-bold text-white">Entity and Schema Signals</div>
          <div className="mt-2 text-slate-300 text-sm">
            AI search relies heavily on clear entities (who you are) and schema (what your pages represent).
          </div>
        </div>

        <div className="grid gap-5">
          <div className="rounded-2xl border border-white/10 bg-[#070d18]/35 p-5">
            <div className="flex items-center justify-between">
              <div className="text-white font-semibold">Entities detected</div>
              <span className={`text-xs px-2.5 py-1 rounded-full border ${hasEntities ? "text-green-300 border-green-500/30 bg-green-500/10" : "text-red-300 border-red-500/30 bg-red-500/10"}`}>
                {hasEntities ? "Found" : "Missing"}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {hasEntities ? (
                entities.slice(0, 10).map((e) => (
                  <span key={e} className="text-xs px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-slate-200">
                    {e}
                  </span>
                ))
              ) : (
                <div className="text-sm text-slate-300">
                  We did not detect clear brand entities. Add Organization schema, consistent NAP, and an about page with explicit business identity.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#070d18]/35 p-5">
            <div className="flex items-center justify-between">
              <div className="text-white font-semibold">Schema types detected</div>
              <span className={`text-xs px-2.5 py-1 rounded-full border ${hasSchema ? "text-green-300 border-green-500/30 bg-green-500/10" : "text-red-300 border-red-500/30 bg-red-500/10"}`}>
                {hasSchema ? "Found" : "Missing"}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {hasSchema ? (
                schemaTypes.slice(0, 12).map((s) => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded-full border border-[#eaff00]/20 bg-[#eaff00]/10 text-[#eaff00]">
                    {s}
                  </span>
                ))
              ) : (
                <div className="text-sm text-slate-300">
                  No schema detected. Add Organization, Website, Breadcrumb, and FAQ schema to improve search and AI understanding.
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ================= COMPETITOR ================= */

function CompetitorPanel({
  youUrl,
  competitorUrl,
  you,
  comp,
}: {
  youUrl: string;
  competitorUrl?: string;
  you: Scores;
  comp?: Scores;
}) {
  const hasComp = Boolean(competitorUrl && comp);

  const deltas = hasComp
    ? {
        authority: clamp((comp!.authority - you.authority), -100, 100),
        aio: clamp((comp!.aio - you.aio), -100, 100),
        geo: clamp((comp!.geo - you.geo), -100, 100),
        aeo: clamp((comp!.aeo - you.aeo), -100, 100),
      }
    : null;

  return (
    <Card className="bg-[#111a2b]/80 backdrop-blur border border-white/10">
      <CardContent className="p-7 space-y-6">
        <div className="flex items-start justify-between gap-6 flex-col md:flex-row">
          <div>
            <div className="text-xl font-bold text-white">Competitor Comparison</div>
            <div className="mt-2 text-slate-300 text-sm">
              Side by side scores, gaps, and where they are winning.
            </div>
          </div>
          <div className="text-xs text-slate-400">
            You: <span className="text-slate-200">{stripTrailingSlash(youUrl)}</span>
            {hasComp && (
              <>
                <span className="mx-2">|</span>
                Competitor: <span className="text-slate-200">{stripTrailingSlash(competitorUrl!)}</span>
              </>
            )}
          </div>
        </div>

        {!hasComp ? (
          <div className="rounded-2xl border border-white/10 bg-[#070d18]/35 p-6 text-slate-300">
            Add a competitor URL and rerun the scan to see who is ahead and why.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <CompareBlock label="Authority" you={you.authority} comp={comp!.authority} delta={deltas!.authority} />
            <CompareBlock label="AIO" you={you.aio} comp={comp!.aio} delta={deltas!.aio} />
            <CompareBlock label="GEO" you={you.geo} comp={comp!.geo} delta={deltas!.geo} />
            <CompareBlock label="AEO" you={you.aeo} comp={comp!.aeo} delta={deltas!.aeo} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CompareBlock({ label, you, comp, delta }: { label: string; you: number; comp: number; delta: number }) {
  const youTier = tierForScore(you);
  const compTier = tierForScore(comp);

  const youMeta = tierMeta(youTier);
  const compMeta = tierMeta(compTier);

  const deltaLabel = delta === 0 ? "Even" : delta > 0 ? `Competitor +${delta}` : `You +${Math.abs(delta)}`;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#070d18]/35 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-white font-semibold">{label}</div>
        <span className="text-xs text-slate-300">{deltaLabel}</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-slate-400">You</div>
          <div className={`mt-1 text-3xl font-extrabold ${youMeta.text}`}>{you}</div>
          <span className={`mt-2 inline-flex text-[10px] px-2 py-0.5 rounded-full border ${youMeta.badge}`}>{youMeta.label}</span>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-slate-400">Competitor</div>
          <div className={`mt-1 text-3xl font-extrabold ${compMeta.text}`}>{comp}</div>
          <span className={`mt-2 inline-flex text-[10px] px-2 py-0.5 rounded-full border ${compMeta.badge}`}>{compMeta.label}</span>
        </div>
      </div>

      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full ${youMeta.bar}`} style={{ width: `${clamp(you)}%` }} />
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full ${compMeta.bar}`} style={{ width: `${clamp(comp)}%` }} />
      </div>
    </div>
  );
}

/* ================= PAGE INSIGHTS ================= */

function PageInsightsPanel({ pages }: { pages: any[] }) {
  return (
    <Card className="bg-[#111a2b]/80 backdrop-blur border border-white/10">
      <CardContent className="p-7 space-y-5">
        <div>
          <div className="text-xl font-bold text-white">SEO crawl by page</div>
          <div className="mt-2 text-slate-300 text-sm">
            If your API returns pages, we show what to fix by URL. If not, this section stays clean and does not break.
          </div>
        </div>

        {pages.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#070d18]/35 p-6 text-slate-300">
            Page level crawl data is not returned yet. When you add it to the API response, this panel will auto populate.
          </div>
        ) : (
          <div className="space-y-4">
            {pages.slice(0, 6).map((p, idx) => (
              <div key={idx} className="rounded-2xl border border-white/10 bg-[#070d18]/35 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-white font-semibold">{p.title || "Page"}</div>
                    <div className="text-xs text-slate-400 break-all">{p.url}</div>
                  </div>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-slate-300 hover:text-white transition underline underline-offset-4"
                  >
                    Open
                  </a>
                </div>

                {p.issues?.length ? (
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    {p.issues.slice(0, 3).map((it: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-red-400/70" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-3 text-sm text-slate-300">No issues listed for this page yet.</div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ================= RECOMMENDATIONS ================= */

function RecommendationsPanel({ recommendations }: { recommendations: any[] }) {
  const grouped = useMemo(() => {
    const crit = recommendations.filter((r) => r.severity === "Critical");
    const mid = recommendations.filter((r) => r.severity === "Needs Work");
    const good = recommendations.filter((r) => r.severity === "Strong");
    return { crit, mid, good };
  }, [recommendations]);

  return (
    <Card className="bg-[#111a2b]/80 backdrop-blur border border-white/10">
      <CardContent className="p-7 space-y-6">
        <div>
          <div className="text-xl font-bold text-white">Recommendations that move the needle</div>
          <div className="mt-2 text-slate-300 text-sm">
            Each item explains why it matters and what to do, so it feels valuable, not generic.
          </div>
        </div>

        {recommendations.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#070d18]/35 p-6 text-slate-300">
            No recommendations returned yet.
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.crit.length > 0 && (
              <GroupBlock title="Critical fixes" badge="Critical" badgeClass={tierMeta("Critical").badge} items={grouped.crit} />
            )}
            {grouped.mid.length > 0 && (
              <GroupBlock title="High impact improvements" badge="Needs Work" badgeClass={tierMeta("Needs Work").badge} items={grouped.mid} />
            )}
            {grouped.good.length > 0 && (
              <GroupBlock title="Already strong" badge="Strong" badgeClass={tierMeta("Strong").badge} items={grouped.good} />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function GroupBlock({ title, badge, badgeClass, items }: { title: string; badge: string; badgeClass: string; items: any[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-white font-semibold">{title}</div>
        <span className={`text-[10px] px-2.5 py-1 rounded-full border ${badgeClass}`}>{badge}</span>
      </div>

      <div className="space-y-3">
        {items.slice(0, 8).map((r, i) => (
          <motion.div
            key={i}
            className="rounded-2xl border border-white/10 bg-[#070d18]/35 p-5 hover:border-[#eaff00]/20 transition"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="text-white font-semibold">{r.title}</div>
              <div className="text-xs text-slate-400">Impact +{r.impact}</div>
            </div>

            <div className="mt-2 text-sm text-slate-300">
              <span className="text-slate-400">Why it matters, </span>
              {r.why}
            </div>

            <div className="mt-2 text-sm text-slate-300">
              <span className="text-slate-400">What to do, </span>
              {r.how}
            </div>

            <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-[#eaff00]" style={{ width: `${clamp(r.impact * 10, 0, 100)}%` }} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
