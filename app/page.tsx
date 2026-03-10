"use client"

import { useState } from "react"

export default function Home() {

  const [website, setWebsite] = useState("")
  const [competitor, setCompetitor] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const runScan = async () => {

    if (!website) return

    setLoading(true)

    try {

      const res = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          website,
          competitor
        })
      })

      const data = await res.json()

      setResults(data)

    } catch (error) {

      console.error("Scan failed", error)

    }

    setLoading(false)
  }

  return (

    <main className="min-h-screen bg-[#030712] text-white px-6">

      {/* HERO */}

      <section className="max-w-6xl mx-auto pt-24 pb-16">

        <h1 className="text-5xl font-bold leading-tight">
          Will ChatGPT Recommend Your Website?
        </h1>

        <p className="text-gray-400 mt-6 max-w-xl">
          Traditional SEO is no longer enough. AuthorityOS scans how AI search
          engines understand your website and shows exactly what prevents your
          pages from being trusted and cited.
        </p>

        {/* INPUTS */}

        <div className="mt-10 flex flex-col md:flex-row gap-4">

          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="Enter your website"
            className="bg-[#111827] border border-[#1f2937] rounded-lg px-4 py-3 w-full"
          />

          <input
            value={competitor}
            onChange={(e) => setCompetitor(e.target.value)}
            placeholder="Competitor (optional)"
            className="bg-[#111827] border border-[#1f2937] rounded-lg px-4 py-3 w-full"
          />

          <button
            onClick={runScan}
            className="bg-yellow-400 text-black px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            {loading ? "Scanning..." : "Run Scan"}
          </button>

        </div>

      </section>

      {/* EXAMPLE SECTION */}

      <section className="max-w-6xl mx-auto mt-20 grid md:grid-cols-2 gap-10">

        <div className="bg-[#0b1220] p-8 rounded-xl border border-[#1f2937]">

          <h3 className="text-2xl font-semibold mb-4">
            What AuthorityOS analyzes
          </h3>

          <ul className="space-y-3 text-gray-400">

            <li>• Entity signals AI uses to identify your brand</li>
            <li>• Schema and structured data coverage</li>
            <li>• Topical authority signals</li>
            <li>• Whether AI engines can extract answers from your content</li>
            <li>• Competitor authority comparison</li>

          </ul>

        </div>

        <div className="bg-[#0b1220] p-8 rounded-xl border border-[#1f2937]">

          <h3 className="text-2xl font-semibold mb-4">
            Example Scan Result
          </h3>

          <div className="space-y-3 text-gray-400">

            <p>
              Authority Score: <span className="text-green-400">82</span>
            </p>

            <p>
              AIO Score: <span className="text-yellow-400">61</span>
            </p>

            <p>
              GEO Score: <span className="text-red-400">38</span>
            </p>

            <p>
              AEO Score: <span className="text-red-400">22</span>
            </p>

          </div>

          <div className="mt-6 text-sm text-gray-500">
            Top Fix: Add organization schema and improve internal linking
            between service pages.
          </div>

        </div>

      </section>

      {/* RESULTS */}

      {results && (

        <section className="max-w-6xl mx-auto mt-24">

          <h2 className="text-3xl font-bold mb-10">
            Scan Results
          </h2>

          <div className="grid md:grid-cols-4 gap-6">

            <Score
              title="Authority"
              value={results.scores.authority}
              color="text-green-400"
            />

            <Score
              title="AIO"
              value={results.scores.aio}
              color="text-yellow-400"
            />

            <Score
              title="GEO"
              value={results.scores.geo}
              color="text-red-400"
            />

            <Score
              title="AEO"
              value={results.scores.aeo}
              color="text-red-400"
            />

          </div>

          {/* RECOMMENDATIONS */}

          <div className="mt-16">

            <h3 className="text-2xl font-semibold mb-6">
              Recommended Fixes
            </h3>

            <div className="grid md:grid-cols-2 gap-6">

              {results.recommendations.map((rec: any, i: number) => (

                <div
                  key={i}
                  className="bg-[#0b1220] p-6 rounded-xl border border-[#1f2937]"
                >

                  <h4 className="font-semibold">
                    {rec.title}
                  </h4>

                  <p className="text-sm text-gray-400 mt-2">
                    Why it matters: {rec.reason}
                  </p>

                  <p className="text-sm text-gray-500 mt-2">
                    Fix: {rec.fix}
                  </p>

                </div>

              ))}

            </div>

          </div>

        </section>

      )}

    </main>
  )
}

function Score({
  title,
  value,
  color
}: {
  title: string
  value: number
  color: string
}) {

  return (

    <div className="bg-[#0b1220] border border-[#1f2937] p-6 rounded-xl text-center">

      <h4 className="text-gray-400 text-sm">
        {title}
      </h4>

      <div className={`text-4xl font-bold mt-2 ${color}`}>
        {value}
      </div>

    </div>

  )
}
