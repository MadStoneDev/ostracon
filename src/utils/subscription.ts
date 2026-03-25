import { createClient } from "@/utils/supabase/server";

export type SubscriptionStatus = "active" | "cancelled" | "expired" | "past_due" | "paused";

export type UserSubscription = {
  id: string;
  status: SubscriptionStatus | null;
  package_name: string;
  package_display_name: string;
  features: Record<string, unknown> | null;
  current_period_end: string | null;
};

/**
 * Get the current user's active subscription, if any.
 */
export async function getUserSubscription(
  userId: string,
): Promise<UserSubscription | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select(
      `
      id,
      status,
      current_period_end,
      subscription_packages (
        name,
        display_name,
        features
      )
    `,
    )
    .eq("profile_id", userId)
    .in("status", ["active", "past_due"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  const pkg = data.subscription_packages as any;

  return {
    id: data.id,
    status: data.status as SubscriptionStatus,
    package_name: pkg?.name || "",
    package_display_name: pkg?.display_name || "",
    features: pkg?.features || null,
    current_period_end: data.current_period_end,
  };
}

/**
 * Check if a user has access to a specific premium feature.
 */
export async function hasFeatureAccess(
  userId: string,
  featureKey: string,
): Promise<boolean> {
  const sub = await getUserSubscription(userId);
  if (!sub || !sub.features) return false;
  return !!sub.features[featureKey];
}

/**
 * Check if a user has any active subscription.
 */
export async function isSubscribed(userId: string): Promise<boolean> {
  const sub = await getUserSubscription(userId);
  return sub !== null && sub.status === "active";
}
