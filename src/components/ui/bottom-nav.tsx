"use client";

import React from "react";
import Link from "next/link";

import {
  IconBell,
  IconCategory,
  IconHome,
  IconLayoutList,
  IconMail,
  IconMenu,
  IconPlug,
  IconSearch,
  IconSquarePlus,
  IconSquareRounded,
  IconSquareRoundedPlus,
  IconSquareRoundedPlusFilled,
  IconUser,
} from "@tabler/icons-react";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  // Hooks
  const pathname = usePathname();
  console.log(pathname);

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 px-2 sm:px-[25px] flex items-center justify-between bg-primary text-dark dark:text-light z-50`}
      style={{
        minHeight: "70px",
      }}
    >
      <Link
        href={`/explore`}
        className={`flex items-center justify-center ${
          pathname.includes("/explore") ? "" : ""
        } w-12 h-12 rounded-full transition-all duration-300 ease-in-out`}
      >
        <IconHome size={24} strokeWidth={2} />
      </Link>

      <Link
        href={`/search`}
        className={`flex items-center justify-center ${
          pathname.includes("/groups") ? "" : ""
        } w-12 h-12 rounded-full transition-all duration-300 ease-in-out`}
      >
        <IconSearch size={24} strokeWidth={2} />
      </Link>

      <Link
        href={`/connect`}
        className={`flex items-center justify-center ${
          pathname.includes("/groups") ? "bg-secondary/50" : ""
        } w-12 h-12 rounded-full transition-all duration-300 ease-in-out`}
      >
        <IconPlug size={24} strokeWidth={2} />
      </Link>

      {/* Main Button */}
      <Link
        href={`/post/new`}
        className={`flex items-center justify-center ${
          pathname.includes("/groups") ? "" : ""
        } rounded-full transition-all duration-300 ease-in-out`}
      >
        <IconSquareRoundedPlusFilled size={54} />
      </Link>

      <Link
        href={`/notifications`}
        className={`flex items-center justify-center ${
          pathname.includes("/notifications") ? "" : ""
        } w-12 h-12 rounded-full transition-all duration-300 ease-in-out`}
      >
        <IconBell size={24} strokeWidth={2} />
      </Link>

      <Link
        href={`/messages`}
        className={`flex items-center justify-center ${
          pathname.includes("/messages") ? "" : ""
        } w-12 h-12 rounded-full transition-all duration-300 ease-in-out`}
      >
        <IconMail size={24} strokeWidth={2} />
      </Link>

      <button
        className={`flex items-center justify-center ${
          pathname.includes("/profile") ? "" : ""
        } w-12 h-12 rounded-full transition-all duration-300 ease-in-out`}
      >
        <IconMenu size={24} strokeWidth={2} />
      </button>
    </nav>
  );
}
