"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitFlagAppeal, submitReportAppeal } from "@/actions/appeal-actions";

export default function AppealForm({
  type,
  resolutionId,
}: {
  type: "flag" | "report";
  resolutionId: string;
}) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const submitFn = type === "flag" ? submitFlagAppeal : submitReportAppeal;
    const result = await submitFn(resolutionId, reason);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => router.push("/"), 2000);
    } else {
      setError(result.error || "Failed to submit appeal");
    }

    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div className="border border-green-200 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
        <p className="font-semibold text-green-700 dark:text-green-400">
          Appeal submitted successfully!
        </p>
        <p className="text-sm text-muted-foreground mt-1">Redirecting...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="reason" className="block text-sm font-medium mb-1">
          Reason for Appeal
        </label>
        <textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explain why you believe this decision should be reconsidered (20-1000 characters)..."
          rows={6}
          className="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          minLength={20}
          maxLength={1000}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          {reason.length}/1000 characters (minimum 20)
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || reason.trim().length < 20}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : "Submit Appeal"}
      </button>
    </form>
  );
}
