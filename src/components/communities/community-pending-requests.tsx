"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

interface PendingRequest {
  user_id: string;
  requested_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
    bio: string | null;
  };
}

interface CommunityPendingRequestsProps {
  communityName: string;
  requests: PendingRequest[];
}

export function CommunityPendingRequests({
  communityName,
  requests: initialRequests,
}: CommunityPendingRequestsProps) {
  const router = useRouter();
  const [requests, setRequests] = useState(initialRequests);
  const [isLoading, setIsLoading] = useState(false);

  const handleRequest = async (
    userId: string,
    username: string,
    approve: boolean,
  ) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/communities/${communityName}/requests/${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ approve }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error || `Failed to ${approve ? "approve" : "reject"} request`,
        );
      }

      setRequests(requests.filter((r) => r.user_id !== userId));
      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : `Failed to ${approve ? "approve" : "reject"} request`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {requests.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          No pending requests
        </p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {requests.map((request) => (
            <div
              key={request.user_id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {request.profiles.avatar_url ? (
                  <img
                    src={request.profiles.avatar_url}
                    alt={request.profiles.username}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {request.profiles.username[0].toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="flex-1">
                  <p className="font-medium">{request.profiles.username}</p>
                  <p className="text-xs text-muted-foreground">
                    Requested{" "}
                    {new Date(request.requested_at).toLocaleDateString()}
                  </p>
                  {request.profiles.bio && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {request.profiles.bio}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    handleRequest(
                      request.user_id,
                      request.profiles.username,
                      true,
                    )
                  }
                  disabled={isLoading}
                  className="p-2 bg-green-600 text-white hover:bg-green-700 rounded disabled:opacity-50"
                  title="Approve"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() =>
                    handleRequest(
                      request.user_id,
                      request.profiles.username,
                      false,
                    )
                  }
                  disabled={isLoading}
                  className="p-2 bg-red-600 text-white hover:bg-red-700 rounded disabled:opacity-50"
                  title="Reject"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
