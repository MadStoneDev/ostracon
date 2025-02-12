"use client";

import RadioGroup from "@/components/ui/radio-group";
import React, { useEffect, useState } from "react";

export default function ReportForm() {
  // States
  const [reason, setReason] = useState("");
  const [moreInfoLength, setMoreInfoLength] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [moreInfo, setMoreInfo] = useState("");

  // Variables
  const MIN_REASON_LENGTH = 15; // Minimum length of the reason in words

  // Effects
  useEffect(() => {
    const words = moreInfo.trim().split(/\s+/).filter(Boolean).length;
    setMoreInfoLength(words);
  }, [moreInfo]);

  return (
    <form className={`flex flex-col items-stretch w-full`}>
      <RadioGroup
        options={[
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
        ]}
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

      <button
        className={`mt-2 py-2 enabled:bg-primary disabled:bg-neutral-400 text-light dark:text-dark hover:enabled:bg-dark dark:hover:enabled:bg-light font-bold disabled:opacity-50 transition-all duration-300 ease-in-out`}
        disabled={selectedOption === null || moreInfoLength < MIN_REASON_LENGTH}
      >
        Report User
      </button>
    </form>
  );
}
