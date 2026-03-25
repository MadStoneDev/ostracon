"use client";

import { useSearchParams } from "next/navigation";
import PlanCard from "@/components/subscription/plan-card";
import type { UserSubscription } from "@/utils/subscription";
import { IconCheck, IconAlertCircle } from "@tabler/icons-react";

type Plan = {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  price_aud_cents: number;
  stripe_price_id: string | null;
  features: Record<string, unknown> | null;
};

type SubscriptionManagerProps = {
  plans: Plan[];
  currentSubscription: UserSubscription | null;
  hasStripeCustomer: boolean;
};

export default function SubscriptionManager({
  plans,
  currentSubscription,
  hasStripeCustomer,
}: SubscriptionManagerProps) {
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("success") === "true";
  const isCancelled = searchParams.get("cancelled") === "true";

  const handleSubscribe = async (priceId: string) => {
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });

    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    }
  };

  const handleManageBilling = async () => {
    const response = await fetch("/api/stripe/portal", {
      method: "POST",
    });

    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Success/Cancel banners */}
      {isSuccess && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
          <IconCheck size={20} />
          <span>Subscription activated! Thank you for your support.</span>
        </div>
      )}

      {isCancelled && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
          <IconAlertCircle size={20} />
          <span>Checkout was cancelled. No charges were made.</span>
        </div>
      )}

      {/* Current subscription info */}
      {currentSubscription && (
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <h2 className="font-semibold">
            Current Plan: {currentSubscription.package_display_name}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Status:{" "}
            <span className="capitalize font-medium">
              {currentSubscription.status}
            </span>
          </p>
          {currentSubscription.current_period_end && (
            <p className="text-sm text-muted-foreground">
              {currentSubscription.status === "active"
                ? "Renews"
                : "Expires"}:{" "}
              {new Date(
                currentSubscription.current_period_end,
              ).toLocaleDateString()}
            </p>
          )}

          {hasStripeCustomer && (
            <button
              onClick={handleManageBilling}
              className="mt-3 px-4 py-2 text-sm font-medium rounded-md bg-neutral-200/70 dark:bg-neutral-50/10 hover:bg-neutral-300 dark:hover:bg-neutral-50/20 transition-colors"
            >
              Manage Billing
            </button>
          )}
        </div>
      )}

      {/* Plan cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          {currentSubscription ? "Change Plan" : "Choose a Plan"}
        </h2>

        {plans.length === 0 ? (
          <p className="text-muted-foreground">
            No subscription plans available yet. Check back soon!
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                name={plan.name}
                displayName={plan.display_name}
                description={plan.description}
                priceAudCents={plan.price_aud_cents}
                features={plan.features}
                stripePriceId={plan.stripe_price_id}
                isCurrentPlan={
                  currentSubscription?.package_name === plan.name
                }
                onSubscribe={handleSubscribe}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
