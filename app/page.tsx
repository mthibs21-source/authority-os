"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* ================= HELPERS ================= */

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function normalizeUrl(input: string) {
  const v = (input || "").trim();
  if (!v) return "";
  return v.startsWith("http://") || v.startsWith("https://") ? v : `https://${v}`;
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
      ring: "border-green-500/40 bg-green-500/10",
      text: "text-green-300",
      bar: "bg-green-500",
      badge: "text-green-300 border-green-500/30 bg-green-500/10",
    };
  }
  if (tier === "Needs Work") {
    return {
      ring: "border-orange-500/40 bg-orange-500/10",
      text: "text-orange-300",
      bar: "bg-orange-500",
      badge: "text-orange-300 border-orange-500/30 bg-orange-500/10",
    };
  }
  return {
    ring: "border-red-500/40 bg-red-500/10",
    text: "text-red-300",
    bar: "bg-red-500",
    badge: "text-red-300 border-red-500/30 bg-red-500/10",
  };
}

function scoreTextClass(score: number) {
  return tierStyles(tierForScore(score)).text;
}

function screenshotUrl(rawUrl: string) {
  const u = normalizeUrl(rawUrl);
  if (!u) return "";
  return `https://image.thum.io/get/width/1400/${u}`;
}

/* ================= TYPES (API SHAPE) ================= */

type Scores = { authority: number; aio: number; geo: number; aeo: number; citation?: number; entity?: number };

type PageAudit = {
  url: string;
  score?: number;
  issues?: string[];
  schemaTypes?: string[];
  h1?: number;
  h2?: number;
  wordCount?: number;
};

type ScanResponse = {
  scores: Scores;
  recommendations?: string[];
  pagesScanned?: number;
  schemaTypes?: string[];
  pages?: PageAudit[];
  competitor?: {
    url: string;
    scores: Scores;
    pagesScanned?: number;
  };
  error?: string;
};

/* ================= MAIN ================= */

export default function AuthorityOS() {
  const [url, setUrl] = useState("");
  const [competitor, setCompetitor] = useState("");
  const [depth, setDepth] = useState(10);

  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<ScanResponse | null>(null);

  const siteShot = useMemo(() => screenshotUrl(url), [url]);

  const runScan = async () => {
    const normalizedUrl = normalizeUrl(url);
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
          competitor: competitor ? normalizeUrl(competitor) : "",
          depth,
        }),
      });

      const json = (await res.json()) as ScanResponse;

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

  const reset = () => {
    setScanned(false);
    setError(null);
    setData(null);
  };

  return (
    <div className="min-h-screen bg-[#070d18] text-white relative overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_18%_20%,rgba(234,255,0,0.16),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(56,189,248,0.14),transparent_45%),radial-gradient(circle_at_50%_85%,rgba(34,197,94,0.12),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:44px_44px]" />

      {/* Top bar (no "AI Search Authority Scanner") */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl border border-[#eaff00]/35 bg-[#111a2b]/70 backdrop-blur flex items-center justify-center shadow-[0_0_25px_rgba(234,255,0,0.12)]">
              <span className="text-[#eaff00] font-extrabold">A</span>
            </div>
            <div>
              <div className="text-white font-semibold leading-none">AuthorityOS</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <span className="text-xs text-slate-400">Instant scan, page-level insights</span>
            <span className="text-xs px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-slate-300">Beta</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-14 pb-10 grid lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#eaff00]/25 bg-[#111a2b]/60 backdrop-blur px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-[#eaff00]" />
            <span className="text-xs text-slate-300">Know what to fix, and what to fix first</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold leading-[1.05]">
            Make your site the one AI engines <span className="text-[#eaff00]">trust</span> and cite
          </h1>

          <p className="text-slate-300 text-lg leading-relaxed max-w-xl">
            AuthorityOS scans your site, shows page-level SEO issues, detects schema and brand signals, and gives a prioritized
            execution plan you can hand to a developer or implement yourself.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => {
                const el = document.getElementById("scan");
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
                setTimeout(() => {
                  const input = document.getElementById("site-input") as HTMLInputElement | null;
                  input?.focus();
                }, 350);
              }}
              className="bg-[#eaff00] hover:bg-[#d7f000] text-black hover:text-black font-extrabold shadow-[0_0_22px_rgba(234,255,0,0.45)] px-6 rounded-2xl"
            >
              Start free scan
            </Button>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="text-xs text-slate-400">Use cases</div>
              <div className="text-sm text-slate-200">Local SEO, SaaS pages, service businesses, content hubs</div>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { k: "Page SEO", v: "Per-page issues" },
              { k: "Schema", v: "Type detection" },
              { k: "AI", v: "Citation likelihood" },
            ].map((it) => (
              <div key={it.k} className="rounded-2xl border border-white/10 bg-[#0b1323]/60 p-4">
                <div className="text-xs text-slate-400">{it.k}</div>
                <div className="text-sm font-semibold text-slate-100 mt-1">{it.v}</div>
              </div>
            ))}
          </div>
        </div>

        <HeroVisual />
      </section>

      {/* Scan card */}
      <section id="scan" className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <Card className="bg-[#111a2b]/85 backdrop-blur border border-[#eaff00]/25 shadow-[0_0_55px_rgba(234,255,0,0.08)]">
          <CardContent className="p-8 sm:p-10 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#eaff00]">Scan your website</h2>
                <p className="mt-2 text-slate-300">Get a score, page-level breakdown, and a prioritized fix plan.</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Depth</span>
                <select
                  value={depth}
                  onChange={(e) => setDepth(Number(e.target.value))}
                  className="bg-[#070d18] border border-[#eaff00]/35 text-white px-3 py-2 rounded-xl"
                >
                  <option value={3}>Light (3 pages)</option>
                  <option value={10}>Standard (10 pages)</option>
                  <option value={25}>Deep (25 pages)</option>
                </select>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              <Input
                id="site-input"
                placeholder="Your website (example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-[#070d18] border-[#eaff00]/35 text-white placeholder:text-slate-400"
              />

              <Input
                placeholder="Competitor (optional)"
                value={competitor}
                onChange={(e) => setCompetitor(e.target.value)}
                className="bg-[#070d18] border-[#eaff00]/35 text-white placeholder:text-slate-400"
              />

              <div className="flex gap-3">
                <Button
                  onClick={runScan}
                  disabled={loading || !normalizeUrl(url)}
                  className="flex-1 bg-[#eaff00] hover:bg-[#d7f000] text-black hover:text-black font-extrabold shadow-[0_0_24px_rgba(234,255,0,0.45)] rounded-2xl"
                >
                  {loading ? "Scanning..." : "Scan now"}
                </Button>

                {scanned && (
                  <Button
                    onClick={reset}
                    variant="outline"
                    className="rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10"
                  >
                    New scan
                  </Button>
                )}
              </div>
            </div>

            {error && <div className="text-red-300">{error}</div>}

            {!!siteShot && (
              <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-5">
                <div className="rounded-2xl border border-[#eaff00]/20 bg-[#070d18]/45 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                    <div className="text-sm text-slate-200 font-semibold">Live preview</div>
                    <div className="text-xs text-slate-400">Shows the site you entered</div>
                  </div>
                  <img
                    src={siteShot}
                    alt="Website screenshot"
                    className="w-full h-[240px] sm:h-[300px] object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#070d18]/30 p-5">
                  <div className="text-sm font-semibold text-slate-100">What you will get</div>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    <li>Page-by-page SEO issues and fixes</li>
                    <li>Schema type detection (Org, Product, FAQ, Article)</li>
                    <li>Brand entity signals and AI citation likelihood</li>
                    <li>Competitor comparison (optional)</li>
                  </ul>
                  <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs text-slate-400">Tip</div>
                    <div className="text-sm text-slate-200">
                      Use the Deep scan when you have multiple services, locations, or a blog.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Results */}
      {data && (
        <section className="relative z-10 max-w-6xl mx-auto px-6 pb-40 space-y-10">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-extrabold text-[#eaff00]">Results</h2>
              <div className="mt-2 text-slate-300">
                {data.pagesScanned ? `Pages scanned: ${data.pagesScanned}` : ""}
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-green-500" /> Strong
              <span className="h-2 w-2 rounded-full bg-orange-500 ml-3" /> Needs work
              <span className="h-2 w-2 rounded-full bg-red-500 ml-3" /> Critical
            </div>
          </div>

          <ScoreGrid scores={data.scores} />

          <div className="grid lg:grid-cols-2 gap-6">
            <SchemaCard schemaTypes={data.schemaTypes || []} />
            <CompetitorCard competitor={data.competitor} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Recommendations items={data.recommendations || []} />
            <ProFeatures />
          </div>

          <PageLevelAudit pages={data.pages || []} />
        </section>
      )}

      {/* Bottom-right credit (not centered) */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="text-xs text-slate-400 px-3 py-2 rounded-full border border-white/10 bg-[#0b1323]/70 backdrop-blur">
          Built by Uplift Digital
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function HeroVisual() {
  return (
    <div className="relative">
      <div className="absolute -inset-8 rounded-[32px] bg-[#eaff00]/10 blur-3xl" />

      <div className="relative rounded-[32px] border border-[#eaff00]/20 bg-[#111a2b]/70 backdrop-blur p-6 shadow-[0_0_70px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-200 font-semibold">Live authority preview</div>
          <span className="text-[11px] text-slate-400">Example</span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <MiniGauge label="Authority" value={78} />
          <MiniGauge label="AIO" value={72} />
          <MiniGauge label="GEO" value={64} />
          <MiniGauge label="AEO" value={58} />
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-[#070d18]/40 p-4">
          <div className="text-xs text-slate-400">Why this matters</div>
          <div className="text-sm text-slate-200 mt-1">
            AI engines prefer clear structure, real brand signals, and schema that helps them understand your content.
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniGauge({ label, value }: { label: string; value: number }) {
  const tier = tierForScore(value);
  const styles = tierStyles(tier);

  return (
    <div className={`rounded-2xl border ${styles.ring} p-4`}>
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-300">{label}</div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${styles.badge}`}>{tier}</span>
      </div>
      <div className={`mt-2 text-3xl font-extrabold ${styles.text}`}>{clamp(value)}</div>
      <div className="mt-3 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full ${styles.bar}`} style={{ width: `${clamp(value)}%` }} />
      </div>
    </div>
  );
}

function ScoreGrid({ scores }: { scores: Scores }) {
  const items = [
    { key: "authority", label: "Authority", value: scores.authority },
    { key: "aio", label: "AIO", value: scores.aio },
    { key: "geo", label: "GEO", value: scores.geo },
    { key: "aeo", label: "AEO", value: scores.aeo },
    ...(typeof scores.citation === "number" ? [{ key: "citation", label: "AI Citation", value: scores.citation }] : []),
    ...(typeof scores.entity === "number" ? [{ key: "entity", label: "Entity", value: scores.entity }] : []),
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((it) => (
        <ScoreCard key={it.key} label={it.label} value={it.value} />
      ))}
    </div>
  );
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  const safe = clamp(value);
  const tier = tierForScore(safe);
  const styles = tierStyles(tier);

  return (
    <Card className="bg-[#111a2b]/80 backdrop-blur border border-white/10">
      <CardContent className="p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-200 font-semibold">{label}</div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${styles.badge}`}>{tier}</span>
        </div>

        <div className="flex items-end justify-between">
          <div className={`text-4xl font-extrabold ${styles.text}`}>{safe}</div>
          <div className="text-xs text-slate-400">/ 100</div>
        </div>

        <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <div className={`h-full ${styles.bar}`} style={{ width: `${safe}%` }} />
        </div>
      </CardContent>
    </Card>
  );
}

function SchemaCard({ schemaTypes }: { schemaTypes: string[] }) {
  const list = (schemaTypes || []).filter(Boolean);

  return (
    <Card className="bg-[#111a2b]/80 backdrop-blur border border-white/10">
      <CardContent className="p-6 space-y-3">
        <div className="text-sm font-semibold text-slate-100">Schema detected</div>
        <div className="text-sm text-slate-300">
          {list.length ? "These schema types help both search engines and AI understand entities." : "No schema types detected yet."}
        </div>
        <div className="flex flex-wrap gap-2">
          {list.length ? (
            list.map((t) => (
              <span key={t} className="text-xs px-2.5 py-1 rounded-full border border-[#eaff00]/25 bg-[#eaff00]/10 text-[#eaff00]">
                {t}
              </span>
            ))
          ) : (
            <span className="text-xs px-2.5 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-300">Missing</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CompetitorCard({ competitor }: { competitor?: ScanResponse["competitor"] }) {
  if (!competitor?.scores) {
    return (
      <Card className="bg-[#111a2b]/80 backdrop-blur border border-white/10">
        <CardContent className="p-6 space-y-2">
          <div className="text-sm font-semibold text-slate-100">Competitor comparison</div>
          <div className="text-sm text-slate-300">Add a competitor URL to compare scores side by side.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#111a2b]/80 backdrop-blur border border-white/10">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-100">Competitor comparison</div>
          <div className="text-xs text-slate-400">{competitor.url}</div>
        </div>

        <div className="space-y-3">
          {(
            [
              { k: "Authority", a: competitor.scores.authority },
              { k: "AIO", a: competitor.scores.aio },
              { k: "GEO", a: competitor.scores.geo },
              { k: "AEO", a: competitor.scores.aeo },
            ] as const
          ).map((row) => (
            <div key={row.k} className="flex items-center justify-between gap-4">
              <div className="text-sm text-slate-300">{row.k}</div>
              <div className={`text-sm font-semibold ${scoreTextClass(row.a)}`}>{clamp(row.a)}</div>
            </div>
          ))}
        </div>

        {!!competitor.pagesScanned && <div className="text-xs text-slate-400">Pages scanned: {competitor.pagesScanned}</div>}
      </CardContent>
    </Card>
  );
}

function Recommendations({ items }: { items: string[] }) {
  const list = (items || []).filter((x) => (x || "").trim());

  return (
    <Card className="bg-[#111a2b]/80 backdrop-blur border border-white/10">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-100">Recommended fixes</div>
            <div className="text-sm text-slate-300">Prioritized actions based on the crawl.</div>
          </div>
        </div>

        {list.length ? (
          <ul className="space-y-3">
            {list.map((r, i) => (
              <li key={`${i}_${r}`} className="rounded-2xl border border-white/10 bg-[#070d18]/35 p-4">
                <div className="text-sm text-slate-100 leading-relaxed">{r}</div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-slate-300">No recommendations returned. Try a deeper scan.</div>
        )}
      </CardContent>
    </Card>
  );
}

function PageLevelAudit({ pages }: { pages: PageAudit[] }) {
  if (!pages?.length) {
    return (
      <Card className="bg-[#111a2b]/80 backdrop-blur border border-white/10">
        <CardContent className="p-6">
          <div className="text-sm font-semibold text-slate-100">Page-level SEO</div>
          <div className="text-sm text-slate-300 mt-2">
            Your API is not returning page-by-page details yet. When you add it, each page will show its own issues and score.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#111a2b]/80 backdrop-blur border border-white/10">
      <CardContent className="p-6 space-y-4">
        <div>
          <div className="text-sm font-semibold text-slate-100">Page-level SEO</div>
          <div className="text-sm text-slate-300">See issues per page so fixes are specific and actionable.</div>
        </div>

        <div className="space-y-3">
          {pages.slice(0, 12).map((p) => (
            <div key={p.url} className="rounded-2xl border border-white/10 bg-[#070d18]/35 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="text-sm text-slate-100 font-semibold break-all">{p.url}</div>
                {typeof p.score === "number" && (
                  <div className={`text-sm font-bold ${scoreTextClass(p.score)}`}>{clamp(p.score)}/100</div>
                )}
              </div>

              {!!p.schemaTypes?.length && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {p.schemaTypes.slice(0, 6).map((t) => (
                    <span key={t} className="text-[11px] px-2 py-0.5 rounded-full border border-[#eaff00]/20 bg-[#eaff00]/10 text-[#eaff00]">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {!!p.issues?.length && (
                <ul className="mt-3 space-y-1 text-sm text-slate-300">
                  {p.issues.slice(0, 5).map((it) => (
                    <li key={it} className="list-disc ml-5">{it}</li>
                  ))}
                </ul>
              )}

              {!p.issues?.length && <div className="mt-3 text-sm text-slate-400">No issues provided for this page.</div>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ProFeatures() {
  return (
    <Card className="bg-[#111a2b]/80 backdrop-blur border border-white/10">
      <CardContent className="p-6 space-y-4">
        <div>
          <div className="text-sm font-semibold text-slate-100">Three features that get you to $50k per month</div>
          <div className="text-sm text-slate-300 mt-1">These are the ones people pay for and keep paying for.</div>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-[#070d18]/35 p-4">
            <div className="text-sm text-slate-100 font-semibold">1. Monitoring and alerts</div>
            <div className="text-sm text-slate-300 mt-1">
              Weekly scans, trend graphs, and alerts when scores drop, pages break, or competitors jump ahead.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#070d18]/35 p-4">
            <div className="text-sm text-slate-100 font-semibold">2. White-label client reports</div>
            <div className="text-sm text-slate-300 mt-1">
              PDF reports with before and after, page fixes, and an execution plan agencies can send to clients.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#070d18]/35 p-4">
            <div className="text-sm text-slate-100 font-semibold">3. Opportunity engine</div>
            <div className="text-sm text-slate-300 mt-1">
              Auto-generate a prioritized list of pages to create, topics to target, and schema to add, mapped to likely impact.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
