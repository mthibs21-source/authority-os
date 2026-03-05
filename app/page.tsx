"use client";

import { useState } from "react";

/* ---------------- HELPERS ---------------- */

function normalize(url: string) {
  if (!url.startsWith("http")) return "https://" + url;
  return url;
}

function scoreColor(score: number) {
  if (score >= 75) return "text-green-400";
  if (score >= 45) return "text-orange-400";
  return "text-red-400";
}

/* ---------------- GAUGE ---------------- */

function Gauge({ value, label }: any) {

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">

      <svg width="120" height="120">

        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#1e293b"
          strokeWidth="10"
          fill="transparent"
        />

        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#eaff00"
          strokeWidth="10"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />

      </svg>

      <div className="text-xl font-bold mt-2">
        {value}
      </div>

      <div className="text-xs text-slate-400 uppercase">
        {label}
      </div>

    </div>
  );
}

/* ---------------- PAGE ---------------- */

export default function Page() {

  const [url, setUrl] = useState("");
  const [competitor, setCompetitor] = useState("");
  const [depth, setDepth] = useState(10);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  async function scan() {

    if (!url) return;

    setLoading(true);
    setError("");
    setData(null);

    try {

      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: normalize(url),
          competitor,
          depth,
        }),
      });

      const json = await res.json();

      if (!json.scores) {
        setError("Scan failed");
      } else {
        setData(json);
      }

    } catch {
      setError("Scan failed");
    }

    setLoading(false);

  }

  return (
    <div className="min-h-screen bg-[#070d18] text-white">

      {/* GRID BACKGROUND */}

      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* NAV */}

      <div className="max-w-6xl mx-auto px-6 pt-8 flex justify-between items-center">

        <h1 className="text-2xl font-bold text-[#eaff00]">
          AuthorityOS
        </h1>

        <div className="text-sm text-slate-400">
          Built by Uplift Digital
        </div>

      </div>

      {/* HERO */}

      <section className="max-w-6xl mx-auto px-6 pt-24 pb-24 grid lg:grid-cols-2 gap-16 items-center">

        <div>

          <h1 className="text-6xl font-extrabold leading-tight">

            Become the  
            <span className="text-[#eaff00]"> Authority</span>  
            AI Engines Cite

          </h1>

          <p className="mt-6 text-slate-300 text-lg max-w-xl">

            AuthorityOS analyzes your website the same way modern AI search engines do.
            Discover entity signals, topical authority, schema coverage and content opportunities.

          </p>

          <button
            onClick={() =>
              document.getElementById("scan")?.scrollIntoView({ behavior: "smooth" })
            }
            className="mt-8 bg-[#eaff00] text-black font-bold px-6 py-3 rounded-xl hover:brightness-110"
          >
            Run Authority Scan
          </button>

        </div>

        <div className="flex justify-center">

          <img
            src="https://images.unsplash.com/photo-1551281044-8f9b6c4d9f3b"
            className="rounded-2xl shadow-2xl border border-[#eaff00]/20"
          />

        </div>

      </section>

      {/* SCANNER */}

      <section id="scan" className="max-w-6xl mx-auto px-6 pb-24">

        <div className="bg-[#111a2b] p-10 rounded-xl border border-[#eaff00]/20">

          <h2 className="text-3xl font-bold text-[#eaff00] mb-6">
            Run Authority Scan
          </h2>

          <div className="grid md:grid-cols-3 gap-4 mb-6">

            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Website URL"
              className="bg-[#070d18] border border-[#eaff00]/20 p-3 rounded"
            />

            <input
              value={competitor}
              onChange={(e) => setCompetitor(e.target.value)}
              placeholder="Competitor URL"
              className="bg-[#070d18] border border-[#eaff00]/20 p-3 rounded"
            />

            <select
              value={depth}
              onChange={(e) => setDepth(Number(e.target.value))}
              className="bg-[#070d18] border border-[#eaff00]/20 p-3 rounded"
            >
              <option value={3}>Light crawl</option>
              <option value={10}>Standard crawl</option>
              <option value={25}>Deep crawl</option>
            </select>

          </div>

          <button
            onClick={scan}
            className="bg-[#eaff00] text-black font-bold px-8 py-3 rounded-xl hover:brightness-110"
          >
            {loading ? "Scanning..." : "Scan Website"}
          </button>

          {error && (
            <div className="text-red-400 mt-4">{error}</div>
          )}

        </div>

      </section>

      {/* RESULTS */}

      {data && (

        <section className="max-w-6xl mx-auto px-6 pb-24 space-y-12">

          {/* GAUGE SCORES */}

          <div className="grid md:grid-cols-4 gap-6">

            <Gauge value={data.scores.authority} label="Authority" />
            <Gauge value={data.scores.aio} label="AIO" />
            <Gauge value={data.scores.geo} label="GEO" />
            <Gauge value={data.scores.aeo} label="AEO" />

          </div>

          {/* WEBSITE PREVIEW */}

          <div className="bg-[#111a2b] p-8 rounded-xl border border-[#eaff00]/10">

            <h3 className="text-xl font-bold mb-4">
              Website Preview
            </h3>

            <img
              src={`https://image.thum.io/get/width/1200/${normalize(url)}`}
              className="rounded-xl border border-white/10"
            />

          </div>

          {/* COMPETITOR */}

          {data.competitor && (

            <div className="bg-[#111a2b] p-8 rounded-xl border border-[#eaff00]/10">

              <h3 className="text-xl font-bold mb-4">
                Competitor Comparison
              </h3>

              <div className="grid md:grid-cols-2 gap-6">

                <div>
                  <div className="text-sm text-slate-400 mb-1">You</div>
                  <div className="text-4xl font-bold text-[#eaff00]">
                    {data.scores.authority}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-slate-400 mb-1">
                    Competitor
                  </div>
                  <div className="text-4xl font-bold text-orange-400">
                    {data.competitor.scores.authority}
                  </div>
                </div>

              </div>

            </div>

          )}

          {/* TOPICAL MAP */}

          <div className="bg-[#111a2b] p-8 rounded-xl border border-[#eaff00]/10">

            <h3 className="text-xl font-bold mb-4">
              Topical Authority Map
            </h3>

            <div className="flex flex-wrap gap-2">

              {data.topicMap.map((t: any, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-[#eaff00]/20 rounded-full text-sm"
                >
                  {t[0]} ({t[1]})
                </span>
              ))}

            </div>

          </div>

          {/* CONTENT OPPORTUNITIES */}

          <div className="bg-[#111a2b] p-8 rounded-xl border border-[#eaff00]/10">

            <h3 className="text-xl font-bold mb-4">
              Content Opportunities
            </h3>

            <ul className="space-y-2 text-slate-300">

              {data.opportunities.map((o: string, i: number) => (
                <li key={i}>{o}</li>
              ))}

            </ul>

          </div>

        </section>

      )}

      {/* FOOTER */}

      <footer className="text-center text-sm text-slate-500 pb-10">
        Built by Uplift Digital
      </footer>

    </div>
  );
}
