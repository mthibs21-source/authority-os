import { NextResponse } from "next/server";

function randomScore(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { website, competitor } = body;

    if (!website) {
      return NextResponse.json({ error: "Missing website" }, { status: 400 });
    }

    const result = {
      website,
      competitor: competitor || null,

      scores: {
        authority: randomScore(60, 95),
        aio: randomScore(40, 85),
        geo: randomScore(20, 80),
        aeo: randomScore(10, 70),
      },

      recommendations: [
        {
          category: "AEO",
          title: "Add FAQ schema",
          reason: "Answer engines extract structured FAQ content",
          fix: "Add FAQ blocks with schema markup to service pages",
        },
        {
          category: "AIO",
          title: "Improve heading structure",
          reason: "AI prefers clean hierarchical content",
          fix: "Use H1, H2, and H3 clearly around answerable sections",
        },
        {
          category: "GEO",
          title: "Strengthen entity signals",
          reason: "AI needs clear understanding of your organization",
          fix: "Add organization schema and mention brand consistently",
        },
        {
          category: "SEO",
          title: "Improve internal linking",
          reason: "Authority clusters help AI understand topical expertise",
          fix: "Link related services and resources together",
        },
      ],
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Scan failed" },
      { status: 500 }
    );
  }
}
