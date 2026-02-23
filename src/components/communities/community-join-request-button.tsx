"use client";

import { useState } from "react";

export default function CommunityJoinRequestButton({
  communityName,
}: {
  communityName: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "requested" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleRequestJoin = async () => {
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch(`/api/communities/${communityName}/join`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok && data.status === "requested") {
        setStatus("requested");
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Failed to submit join request");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  if (status === "requested") {
    return (
      <button
        disabled
        className="px-4 py-2 bg-muted text-muted-foreground rounded-md cursor-not-allowed"
      >
        Request Pending
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={handleRequestJoin}
        disabled={status === "loading"}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
      >
        {status === "loading" ? "Requesting..." : "Request to Join"}
      </button>
      {status === "error" && (
        <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
      )}
    </div>
  );
}
