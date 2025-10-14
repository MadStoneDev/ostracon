"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { IconFlag, IconSkull, IconX } from "@tabler/icons-react";
import { moderationAPI } from "@/utils/moderation-api";

type ReportType = "image" | "post" | "profile";

interface ReportButtonProps {
  type: ReportType;
  targetId: string; // post ID, user ID, or image URL
  currentUser: User;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const reportReasons = {
  image: [
    "Inappropriate content",
    "Nudity or sexual content",
    "Violence or gore",
    "Drugs or weapons",
    "Spam",
    "Copyright violation",
    "Other",
  ],
  post: [
    "Harassment or bullying",
    "Hate speech",
    "Violence or threats",
    "Spam",
    "Misinformation",
    "Inappropriate content",
    "Other",
  ],
  profile: [
    "Impersonation",
    "Harassment",
    "Inappropriate username",
    "Inappropriate profile picture",
    "Spam account",
    "Underage user",
    "Other",
  ],
};

export default function ReportButton({
  type,
  targetId,
  currentUser,
  className = "",
  size = "md",
}: ReportButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReported, setIsReported] = useState(false);

  const iconSize = size === "sm" ? "16" : size === "lg" ? "30" : "24";
  const buttonSize = size === "sm" ? "p-1" : size === "lg" ? "p-3" : "p-2";

  const handleReport = async () => {
    if (!selectedReason) return;

    setIsSubmitting(true);

    try {
      const reason = selectedReason === "Other" ? customReason : selectedReason;

      let result;
      switch (type) {
        case "image":
          result = await moderationAPI.reportImage(
            targetId,
            "",
            currentUser.id,
            reason,
          );
          break;
        case "post":
          result = await moderationAPI.reportPost(
            targetId,
            currentUser.id,
            reason,
          );
          break;
        case "profile":
          result = await moderationAPI.reportProfile(
            targetId,
            currentUser.id,
            reason,
          );
          break;
      }

      if (!result.error) {
        setIsReported(true);
        setShowModal(false);
        setTimeout(() => setIsReported(false), 3000); // Reset after 3 seconds
      }
    } catch (error) {
      console.error("Error reporting content:", error);
      alert("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isReported) {
    return (
      <div
        className={`${buttonSize} text-green-600 dark:text-green-400 ${className}`}
      >
        <span className="text-xs">Reported</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`${buttonSize} text-dark dark:text-light hover:text-primary md:hover:scale-110 transition-all duration-300 ease-in-out ${className}`}
        title={`Report ${type}`}
      >
        {type === "profile" ? (
          <IconSkull size={iconSize} />
        ) : (
          <IconFlag size={iconSize} />
        )}
      </button>

      {/* Report Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold">Report {type}</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-neutral-500 hover:text-neutral-700"
                >
                  <IconX className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  Why are you reporting this {type}?
                </p>

                <div className="space-y-2">
                  {reportReasons[type].map((reason) => (
                    <label key={reason} className="flex items-center">
                      <input
                        type="radio"
                        name="reason"
                        value={reason}
                        checked={selectedReason === reason}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">{reason}</span>
                    </label>
                  ))}
                </div>

                {selectedReason === "Other" && (
                  <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Please describe the issue..."
                    className="w-full mt-3 p-2 border border-neutral-300 dark:border-neutral-600 rounded focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-neutral-700"
                    rows={3}
                  />
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setSelectedReason("");
                    setShowModal(false);
                  }}
                  className="px-4 py-2 text-neutral-600 hover:text-neutral-800 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReport}
                  disabled={
                    !selectedReason ||
                    (selectedReason === "Other" && !customReason.trim()) ||
                    isSubmitting
                  }
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Reporting..." : "Submit Report"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
