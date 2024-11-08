"use client";

import React from "react";
import { IconNotes } from "@tabler/icons-react";

export default function BigButton({
  title = "Posted",
  indicator,
  direction = "right",
  active = false,
}: {
  title: string;
  indicator: React.ReactNode;
  direction?: "left" | "right";
  active?: boolean;
}) {
  return (
    <button
      className={`flex ${
        direction === "left" ? "flex-row-reverse" : "flex-row"
      } items-center h-12 rounded-full ${
        active && "bg-primary"
      } font-serif text-base font-bold text-dark`}
    >
      <span className={`${direction === "left" ? "pr-5 pl-3" : "pl-5 pr-3"}`}>
        {title}
      </span>
      <div
        className={`p-2 grid place-content-center w-12 h-12 rounded-full ${
          active && "bg-secondary"
        } scale-105 text-sm font-bold overflow-hidden`}
      >
        {indicator}
      </div>
    </button>
  );
}
