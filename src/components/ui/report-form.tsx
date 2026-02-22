"use client";

import RadioGroup from "@/components/ui/radio-group";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { reportUser } from "@/actions/report-actions";

export default function ReportForm({ userId }: { userId: string }) {
  // States
  const router = useRouter();
  const [moreInfoLength, setMoreInfoLength] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [moreInfo, setMoreInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Variables
  const MIN_REASON_LENGTH = 15; // Minimum length of the reason in words

  const options = [
    {
      label: "Inappropriate or offensive content",
      value: "inappropriate",
    },
    {
      label: "This person is pretending to be someone else",
      value: "fake_account",
    },
    {
      label: "This person is harassing me or someone else",
      value: "harassment",
    },
    { label: "Suspicious or scam activity", value: "suspicious" },
    {
      label: "Sharing personal or private information",
      value: "privacy",
    },
    {
      label: "This content contains violence or physical harm",
      value: "violence",
    },
    { label: "Spam or unwanted commercial content", value: "spam" },
    {
      label: "I'm concerned about this person's wellbeing",
      value: "concern",
    },
  ];

  // Effects
  useEffect(() => {
    const words = moreInfo.trim().split(/\s+/).filter(Boolean).length;
    setMoreInfoLength(words);
  }, [moreInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOption === null || moreInfoLength < MIN_REASON_LENGTH) return;

    setIsSubmitting(true);
    setError(null);

    const reason = options[selectedOption].value;
    const result = await reportUser(userId, reason, moreInfo);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.back();
      }, 1500);
    } else {
      setError(result.error || "Failed to report user");
    }

    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div className="p-4 text-center">
        <p className="text-green-600 dark:text-green-400 font-bold">
          Thank you for your report. We will review it shortly.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col items-stretch w-full`}
    >
      <RadioGroup
        options={options}
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
      />

      <article className={`my-4`}>
        <span className={`text-sm font-bold`}>
          Please provide more details (min. {MIN_REASON_LENGTH} words)
        </span>
        <textarea
          className={`py-2 w-full h-[100px] bg-white dark:bg-dark text-sm font-light resize-none border-b border-neutral-300 focus:outline-none focus:ring-none placeholder:text-neutral-400 dark:placeholder:text-light`}
          placeholder={`Start typing here...`}
          value={moreInfo}
          onChange={(e) => {
            setMoreInfo(e.target.value);
          }}
        />
      </article>

      {error && (
        <div className="mb-2 p-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        className={`mt-2 py-2 enabled:bg-primary disabled:bg-neutral-400 text-light dark:text-dark hover:enabled:bg-dark dark:hover:enabled:bg-light font-bold disabled:opacity-50 transition-all duration-300 ease-in-out`}
        disabled={
          selectedOption === null ||
          moreInfoLength < MIN_REASON_LENGTH ||
          isSubmitting
        }
      >
        {isSubmitting ? "Submitting..." : "Report User"}
      </button>
    </form>
  );
}
