"use client";

import React from "react";
import Link from "next/link";

import {
  IconBell,
  IconCategory,
  IconLayoutList,
  IconMail,
  IconUser,
} from "@tabler/icons-react";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  // Hooks
  const pathname = usePathname();
  console.log(pathname);

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 flex items-stretch bg-secondary text-dark dark:text-dark z-50`}
      style={{
        minHeight: "50px",
      }}
    >
      <Link
        href={`/explore`}
        className={`flex-grow flex items-center justify-center ${
          pathname.includes("/explore") ? "bg-primary" : "hover:bg-primary/35"
        } transition-all duration-300 ease-in-out`}
      >
        <IconLayoutList size={28} strokeWidth={2} />
      </Link>

      <Link
        href={`/groups`}
        className={`flex-grow flex items-center justify-center ${
          pathname.includes("/groups") ? "bg-primary" : "hover:bg-primary/35"
        } transition-all duration-300 ease-in-out`}
      >
        <IconCategory size={28} strokeWidth={2} />
      </Link>

      <Link
        href={`/messages`}
        className={`flex-grow flex items-center justify-center ${
          pathname.includes("/messages") ? "bg-primary" : "hover:bg-primary/35"
        } transition-all duration-300 ease-in-out`}
      >
        <IconMail size={28} strokeWidth={2} />
      </Link>

      <Link
        href={`/notifications`}
        className={`flex-grow flex items-center justify-center ${
          pathname.includes("/notifications")
            ? "bg-primary"
            : "hover:bg-primary/35"
        } transition-all duration-300 ease-in-out`}
      >
        <IconBell size={28} strokeWidth={2} />
      </Link>

      <Link
        href={`/profile`}
        className={`flex-grow flex items-center justify-center ${
          pathname.includes("/profile") ? "bg-primary" : "hover:bg-primary/35"
        } transition-all duration-300 ease-in-out`}
      >
        <IconUser size={28} strokeWidth={2} />
      </Link>
    </nav>
  );
}
