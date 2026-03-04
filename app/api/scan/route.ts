import { NextResponse } from "next/server";

export async function POST(req: Request) {

  try {

    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    // simulate analysis delay
    await new Promise(r => setTimeout(r, 800));

    // generate demo scores
    const scores = {
      authority: Math.floor(Math.random() * 40) + 40,
      aio: Math.floor(Math.random() * 40) + 40,
      geo: Math.floor(Math.random() * 40) + 40,
      aeo: Math.floor(Math.random() * 40) + 40,
    };

    const recommendations = [
      "Add structured data schema to improve AI understanding",
      "Expand topical authority with long-form content",
      "Improve entity signals for brand recognition",
      "Add FAQ sections targeting AI search queries",
      "Increase internal linking across related pages"
    ];

    return NextResponse.json({
      scores,
      recommendations
    });

  } catch (error) {

    return NextResponse.json(
      { error: "Scan failed" },
      { status: 500 }
    );

  }

}
