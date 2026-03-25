import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getUserSubscription } from "@/utils/subscription";
import SubscriptionManager from "./subscription-manager";

export const metadata = {
  title: "Subscription | Ostracon",
};

export default async function SubscriptionPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Fetch available plans
  const { data: plans } = await supabase
    .from("subscription_packages")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  // Get current subscription
  const currentSubscription = await getUserSubscription(user.id);

  // Check for Stripe customer ID
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex flex-col gap-6 p-4 pb-[100px]">
      <div>
        <h1 className="text-2xl font-bold">Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing
        </p>
      </div>

      <SubscriptionManager
        plans={plans || []}
        currentSubscription={currentSubscription}
        hasStripeCustomer={!!profile?.stripe_customer_id}
      />
    </div>
  );
}
