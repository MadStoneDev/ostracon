"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";

import {
  IconInfoCircleFilled,
  IconSun,
  IconTool,
  IconX,
  IconLockOpen,
  IconMoon,
  IconSearch,
} from "@tabler/icons-react";

export default function MainNav({ user = null }: { user?: any }) {
  const [userHasPin, setUserHasPin] = useState(false);
  const [isLocking, setIsLocking] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const handleLock = async () => {
    setIsLocking(true);

    try {
      const response = await fetch("/api/pin/lock", {
        method: "POST",
      });

      if (response.ok) {
        // Middleware will catch and redirect on next navigation
        router.push("/locked");
      } else {
        console.error("Failed to lock account");
        setIsLocking(false);
      }
    } catch (error) {
      console.error("Error locking account:", error);
      setIsLocking(false);
    }
  };

  useEffect(() => {
    const checkPinStatus = async () => {
      try {
        const response = await fetch("/api/pin/check-pin");
        const { hasPin } = await response.json();
        setUserHasPin(hasPin);
      } catch (error) {
        console.error("Error checking PIN status:", error);
      }
    };

    if (user) {
      checkPinStatus();
    }
  }, [user]);

  return (
    <nav
      className="sticky px-4 md:px-6 top-0 left-0 right-0 flex justify-between items-stretch gap-10 bg-light dark:bg-dark z-40 transition-all duration-300 ease-in-out"
      style={{ height: "70px" }}
    >
      <section className="flex items-center font-accent tracking-tight text-2xl">
        <Link href="/">
          <Image
            alt="Ostracon logo"
            src="/ostracon-logo-dark.svg"
            width={120}
            height={20}
            className="hidden dark:block h-5"
          />
          <Image
            alt="Ostracon logo"
            src="/ostracon-logo-light.svg"
            width={120}
            height={20}
            className="block dark:hidden h-5"
          />
        </Link>
      </section>

      <section className="flex-grow flex justify-end items-center gap-4 z-50">
        {user && (
          <button
            onClick={() => {
              document.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }),
              );
            }}
            className="hover:text-primary transition-all duration-300 ease-in-out"
            aria-label="Search (Ctrl+K)"
          >
            <IconSearch size={22} strokeWidth={2} />
          </button>
        )}

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="hover:text-primary transition-all duration-300 ease-in-out"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? (
            <IconSun size={24} strokeWidth={2} />
          ) : (
            <IconMoon size={24} strokeWidth={2} />
          )}
        </button>

        {user && userHasPin && (
          <button
            onClick={handleLock}
            disabled={isLocking}
            className="hover:text-primary transition-all duration-300 ease-in-out disabled:opacity-50"
            aria-label="Lock account"
          >
            <IconLockOpen size={24} strokeWidth={2} />
          </button>
        )}

        {user ? (
          <>
            {pathname === "/post/new" ? (
              <button
                className="hover:text-primary transition-all duration-300 ease-in-out"
                onClick={() => router.back()}
                aria-label="Close"
              >
                <IconX size={22} strokeWidth={2} />
              </button>
            ) : (
              <Link
                href="/settings"
                className="hover:text-primary transition-all duration-300 ease-in-out"
                aria-label="Settings"
              >
                <IconTool size={22} strokeWidth={2} />
              </Link>
            )}
          </>
        ) : (
          <Link
            href="/info"
            className="hover:text-primary transition-all duration-200"
            aria-label="About Ostracon"
          >
            <IconInfoCircleFilled size={28} strokeWidth={1.5} />
          </Link>
        )}
      </section>
    </nav>
  );
}
