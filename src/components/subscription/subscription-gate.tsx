"use client";

import Link from "next/link";
import { IconLock } from "@tabler/icons-react";

type SubscriptionGateProps = {
  isSubscribed: boolean;
  children: React.ReactNode;
  featureName?: string;
};

/**
 * Wraps premium content. Shows an upgrade prompt if the user isn't subscribed.
 */
export default function SubscriptionGate({
  isSubscribed,
  children,
  featureName = "This feature",
}: SubscriptionGateProps) {
  if (isSubscribed) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
      <IconLock size={40} className="text-muted-foreground mb-3" />
      <h3 className="text-lg font-semibold mb-1">Premium Feature</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {featureName} requires an active subscription.
      </p>
      <Link
        href="/settings/subscription"
        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
      >
        View Plans
      </Link>
    </div>
  );
}
