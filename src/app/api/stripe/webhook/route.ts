import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 },
    );
  }

  let event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const userId = session.metadata?.supabase_user_id;

        if (!userId || !session.subscription) break;

        const subscription = await getStripe().subscriptions.retrieve(
          session.subscription as string,
        ) as any;

        const priceId = subscription.items?.data?.[0]?.price?.id;

        const { data: pkg } = await supabase
          .from("subscription_packages")
          .select("id")
          .eq("stripe_price_id", priceId)
          .single();

        if (pkg) {
          await supabase.from("subscriptions").insert({
            profile_id: userId,
            package_id: pkg.id,
            stripe_subscription_id: subscription.id,
            stripe_checkout_id: session.id,
            status: "active",
            current_period_start: new Date(
              subscription.current_period_start * 1000,
            ).toISOString(),
            current_period_end: new Date(
              subscription.current_period_end * 1000,
            ).toISOString(),
          });
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as any;
        const subRef = invoice.subscription;
        if (!subRef) break;

        const subId = typeof subRef === "string" ? subRef : subRef.id;
        const subscription = await getStripe().subscriptions.retrieve(subId) as any;

        await supabase
          .from("subscriptions")
          .update({
            status: "active",
            current_period_start: new Date(
              subscription.current_period_start * 1000,
            ).toISOString(),
            current_period_end: new Date(
              subscription.current_period_end * 1000,
            ).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subId);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        const subRef = invoice.subscription;
        if (!subRef) break;

        const subId = typeof subRef === "string" ? subRef : subRef.id;

        await supabase
          .from("subscriptions")
          .update({
            status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subId);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any;

        const statusMap: Record<string, string> = {
          active: "active",
          past_due: "past_due",
          canceled: "cancelled",
          unpaid: "past_due",
          paused: "paused",
        };

        await supabase
          .from("subscriptions")
          .update({
            status: statusMap[subscription.status] || subscription.status,
            cancel_at: subscription.cancel_at
              ? new Date(subscription.cancel_at * 1000).toISOString()
              : null,
            cancelled_at: subscription.canceled_at
              ? new Date(subscription.canceled_at * 1000).toISOString()
              : null,
            current_period_end: subscription.current_period_end
              ? new Date(
                  subscription.current_period_end * 1000,
                ).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;

        await supabase
          .from("subscriptions")
          .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
