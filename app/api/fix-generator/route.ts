import { NextResponse } from "next/server";

type Input = {
  websiteName: string;
  websiteUrl: string;
  type: "Organization" | "FAQPage" | "BreadcrumbList";
  faqs?: Array<{ q: string; a: string }>;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Input;

    if (!body.websiteName || !body.websiteUrl || !body.type) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const baseUrl = body.websiteUrl.replace(/\/$/, "");

    if (body.type === "Organization") {
      const jsonld = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: body.websiteName,
        url: baseUrl,
      };

      return NextResponse.json({
        type: "Organization",
        code: `<script type="application/ld+json">\n${JSON.stringify(jsonld, null, 2)}\n</script>`,
      });
    }

    if (body.type === "BreadcrumbList") {
      const jsonld = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: baseUrl,
          },
        ],
      };

      return NextResponse.json({
        type: "BreadcrumbList",
        code: `<script type="application/ld+json">\n${JSON.stringify(jsonld, null, 2)}\n</script>`,
      });
    }

    if (body.type === "FAQPage") {
      const faqs = (body.faqs || []).slice(0, 12);
      const jsonld = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      };

      return NextResponse.json({
        type: "FAQPage",
        code: `<script type="application/ld+json">\n${JSON.stringify(jsonld, null, 2)}\n</script>`,
      });
    }

    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Fix generator failed" }, { status: 500 });
  }
}