"use client";

import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";

type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

export default function ErrorState({
  message = "Something went wrong",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <IconAlertTriangle size={40} className="text-muted-foreground mb-3" />
      <p className="text-muted-foreground mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <IconRefresh size={18} />
          Try Again
        </button>
      )}
    </div>
  );
}
