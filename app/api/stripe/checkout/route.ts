// Stripe Checkout — skapar en hosted-checkout-session för Pro/Family-tier.
// Klienten POSTar { tier, userId, userEmail } och får tillbaka { url }.
// Vid lyckad betalning fortsätter Stripe webhook → /api/stripe/webhook → uppdaterar
// fluentic_profiles.tier i Supabase.
//
// Setup:
// 1. STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET i Vercel-env
// 2. Skapa 2 produkter i Stripe Dashboard → Pro (149 kr/mån) + Family (299 kr/mån)
// 3. Kopiera price-IDs → STRIPE_PRICE_PRO + STRIPE_PRICE_FAMILY
// 4. Skapa webhook i Stripe Dashboard → endpoint = https://fluentic.aiupscale.agency/api/stripe/webhook
//    Events: checkout.session.completed, customer.subscription.deleted, customer.subscription.updated
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeSecretKey, getStripePriceIds } from "@/lib/env";

export const runtime = "nodejs";

interface Body {
  tier: "pro" | "family";
  userId: string;
  userEmail: string;
}

export async function POST(req: Request) {
  const secretKey = getStripeSecretKey();
  if (!secretKey) {
    return NextResponse.json(
      { error: "Stripe är ej konfigurerat — sätt STRIPE_SECRET_KEY i Vercel" },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Ogiltig JSON" }, { status: 400 });
  }

  if (!body.userId || !body.userEmail) {
    return NextResponse.json({ error: "userId + userEmail krävs" }, { status: 400 });
  }

  const priceIds = getStripePriceIds();
  const priceId = body.tier === "family" ? priceIds.family : priceIds.pro;
  if (!priceId) {
    return NextResponse.json(
      { error: `Stripe Price ID saknas för ${body.tier} (sätt STRIPE_PRICE_${body.tier.toUpperCase()})` },
      { status: 503 },
    );
  }

  // Använd dynamisk URL från request (funkar både lokalt och på vilken Vercel-domän som helst)
  const origin = req.headers.get("origin") ?? "https://fluentic.aiupscale.agency";

  const stripe = new Stripe(secretKey);
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: body.userEmail,
      // metadata kommer med i webhook så vi vet vilken user det gäller
      metadata: { userId: body.userId, tier: body.tier },
      subscription_data: {
        metadata: { userId: body.userId, tier: body.tier },
      },
      success_url: `${origin}/account?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=cancelled`,
      // Tillåt rabattkoder
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Stripe-fel";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
