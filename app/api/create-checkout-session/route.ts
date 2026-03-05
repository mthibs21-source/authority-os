import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {

const body = await req.json();
const priceId = body.priceId;

const session = await stripe.checkout.sessions.create({
mode: "subscription",
payment_method_types: ["card"],
line_items: [{ price: priceId, quantity: 1 }],
success_url: `${process.env.APP_URL}/success`,
cancel_url: `${process.env.APP_URL}/`,
});

return NextResponse.json({ url: session.url });

}