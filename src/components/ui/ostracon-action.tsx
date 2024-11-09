"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { IconBallpen, IconPencil } from "@tabler/icons-react";

export default function OstraconAction() {
  // Hooks
  const pathname = usePathname();

  return (
    <Link
      href={`/post/new`}
      className={`fixed pr-0.5 grid place-content-center w-20 h-20 rounded-full bg-primary shadow-lg hover:shadow-xl shadow-dark/35 hover:scale-105 text-dark z-50 transition-all duration-300 ease-in-out`}
      style={{
        bottom: "80px",
        right: "20px",
      }}
    >
      <IconBallpen size={36} strokeWidth={2} />
    </Link>
  );
}
