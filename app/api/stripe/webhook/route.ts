// Stripe webhook — tar emot events när checkout lyckas eller subscription ändras
// och uppdaterar fluentic_profiles.tier i Supabase via service_role-nyckeln.
//
// Events vi hanterar:
// - checkout.session.completed → tier sätts (pro/family)
// - customer.subscription.deleted → tier nedgraderas till free
// - customer.subscription.updated → tier uppdateras (om plan bytts)
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import {
  getStripeSecretKey,
  getStripeWebhookSecret,
  getSupabaseServiceRoleKey,
} from "@/lib/env";

export const runtime = "nodejs";

// Stripe webhooks behöver raw body för signature-verifiering — Next.js
// streamar req.text() som ger oss rätt format
export async function POST(req: Request) {
  const secretKey = getStripeSecretKey();
  const webhookSecret = getStripeWebhookSecret();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = getSupabaseServiceRoleKey();

  if (!secretKey || !webhookSecret) {
    return NextResponse.json({ error: "Stripe ej konfigurerat" }, { status: 503 });
  }
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: "Supabase admin-nyckel saknas" }, { status: 503 });
  }

  const stripe = new Stripe(secretKey);
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Ingen signatur" }, { status: 400 });

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ogiltig signatur";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Service-role-klient kan uppdatera fluentic_profiles utan RLS-begränsning
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier as "pro" | "family" | undefined;
        if (userId && tier) {
          await supabase.from("fluentic_profiles").update({ tier }).eq("id", userId);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (userId) {
          // Subscription cancelad — nedgradera till free
          await supabase.from("fluentic_profiles").update({ tier: "free" }).eq("id", userId);
        }
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        const newTier = sub.metadata?.tier as "pro" | "family" | undefined;
        // Om subscription är aktiv, uppdatera tier; annars nedgradera
        if (userId) {
          const isActive = sub.status === "active" || sub.status === "trialing";
          await supabase
            .from("fluentic_profiles")
            .update({ tier: isActive && newTier ? newTier : "free" })
            .eq("id", userId);
        }
        break;
      }
      default:
        // Andra events ignoreras tyst
        break;
    }
    return NextResponse.json({ received: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Webhook-fel";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
