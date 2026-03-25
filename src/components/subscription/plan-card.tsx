"use client";

import { useState } from "react";
import { IconCheck } from "@tabler/icons-react";

type PlanCardProps = {
  name: string;
  displayName: string;
  description: string | null;
  priceAudCents: number;
  features: Record<string, unknown> | null;
  stripePriceId: string | null;
  isCurrentPlan: boolean;
  onSubscribe: (priceId: string) => Promise<void>;
};

export default function PlanCard({
  name,
  displayName,
  description,
  priceAudCents,
  features,
  stripePriceId,
  isCurrentPlan,
  onSubscribe,
}: PlanCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const priceDisplay = (priceAudCents / 100).toFixed(2);

  const featureList = features
    ? Object.entries(features)
        .filter(([, value]) => value === true || typeof value === "string")
        .map(([key, value]) =>
          typeof value === "string" ? value : key.replace(/_/g, " "),
        )
    : [];

  const handleClick = async () => {
    if (!stripePriceId || isCurrentPlan) return;
    setIsLoading(true);
    try {
      await onSubscribe(stripePriceId);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`relative flex flex-col p-6 rounded-xl border-2 transition-all ${
        isCurrentPlan
          ? "border-primary bg-primary/5"
          : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
      }`}
    >
      {isCurrentPlan && (
        <span className="absolute -top-3 left-4 px-3 py-0.5 bg-primary text-white text-xs font-bold rounded-full">
          Current Plan
        </span>
      )}

      <h3 className="text-xl font-bold">{displayName}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      )}

      <div className="mt-4">
        <span className="text-3xl font-bold">${priceDisplay}</span>
        <span className="text-muted-foreground">/month</span>
      </div>

      {featureList.length > 0 && (
        <ul className="mt-4 space-y-2 flex-grow">
          {featureList.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <IconCheck size={16} className="text-green-500 shrink-0" />
              <span className="capitalize">{feature}</span>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={handleClick}
        disabled={isCurrentPlan || isLoading || !stripePriceId}
        className={`mt-6 w-full py-2.5 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          isCurrentPlan
            ? "bg-gray-200 dark:bg-gray-700 text-muted-foreground"
            : "bg-primary text-white hover:bg-primary/90"
        }`}
      >
        {isLoading
          ? "Redirecting..."
          : isCurrentPlan
            ? "Current Plan"
            : "Subscribe"}
      </button>
    </div>
  );
}
