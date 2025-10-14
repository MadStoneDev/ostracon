"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";

import {
  IconInfoCircleFilled,
  IconSun,
  IconTool,
  IconX,
  IconLock,
  IconLockOpen,
  IconMoonStars,
  IconMoon,
} from "@tabler/icons-react";

export default function MainNav({ user = null }: { user?: any }) {
  // States
  const [userHasPin, setUserHasPin] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Hooks
  const router = useRouter();
  const pathname = usePathname();

  const { theme, setTheme } = useTheme();

  // Functions
  const handleLock = async () => {
    setIsLocked(true);

    try {
      const response = await fetch("/api/pin/lock", {
        method: "POST",
      });

      if (response.ok) {
        window.location.href = "/locked";
      } else {
        console.error("Failed to lock account");
      }
    } catch (error) {
      setIsLocked(false);
      console.error("Error locking account:", error);
    }
  };

  // Effecs
  useEffect(() => {
    const checkPinStatus = async () => {
      const hasPin = await fetch("/api/pin/check-pin");
      const { hasPin: userHasPin } = await hasPin.json();
      setUserHasPin(userHasPin);
    };

    checkPinStatus();
  }, []);

  return (
    <nav
      className={`sticky px-4 md:px-6 top-0 left-0 right-0 flex justify-between items-stretch gap-10 bg-light dark:bg-dark z-40 transition-all duration-300 ease-in-out`}
      style={{
        height: "70px",
      }}
    >
      <section
        className={`flex items-center font-accent tracking-tight text-2xl`}
      >
        <Link href={`/`}>
          {/* Ostracon Logo for Dark Mode */}
          <img
            alt={`Ostracon logo`}
            src={`/ostracon-logo-dark.svg`}
            className={`hidden dark:block h-5`}
          />

          {/* Ostracon Logo for Light Mode */}
          <img
            alt={`Ostracon logo`}
            src={`/ostracon-logo-light.svg`}
            className={`block dark:hidden h-5`}
          />
        </Link>
      </section>

      <section className={`flex-grow flex justify-end items-center gap-4 z-50`}>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={`hover:text-primary transition-all duration-300 ease-in-out`}
        >
          {theme === "dark" ? (
            <IconSun size={24} strokeWidth={2} />
          ) : (
            <IconMoon size={24} strokeWidth={2} />
          )}
        </button>

        {userHasPin && (
          <button
            onClick={handleLock}
            className={`hover:text-primary transition-all duration-300 ease-in-out`}
          >
            {isLocked ? (
              <IconLock size={24} strokeWidth={2} />
            ) : (
              <IconLockOpen size={24} strokeWidth={2} />
            )}
          </button>
        )}

        {user ? (
          <>
            {pathname === "/post/new" ? (
              <button
                className={`hover:text-primary transition-all duration-300 ease-in-out`}
                onClick={() => router.back()}
              >
                <IconX size={22} strokeWidth={2} />
              </button>
            ) : (
              <Link
                href={`/settings`}
                className={`hover:text-primary transition-all duration-300 ease-in-out`}
              >
                <IconTool size={22} strokeWidth={2} />
              </Link>
            )}
          </>
        ) : (
          <Link
            href={`/info`}
            className={`hover:text-primary transition-all duration-200`}
          >
            <IconInfoCircleFilled size={28} strokeWidth={1.5} />
          </Link>
        )}
      </section>
    </nav>
  );
}
