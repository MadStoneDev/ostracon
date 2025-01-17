"use client";

import Link from "next/link";
import { useTheme } from "next-themes";

import {
  IconInfoCircle,
  IconInfoCircleFilled,
  IconSun,
  IconTool,
  IconX,
} from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";

export default function MainNav({
  authenticated = false,
}: {
  authenticated?: boolean;
}) {
  const { theme, setTheme } = useTheme();

  // Hooks
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav
      className={`fixed top-0 left-0 right-0 px-[25px] flex justify-between items-stretch gap-10 z-50`}
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
        {authenticated ? null : (
          <>
            <Link
              href={`/info`}
              className={`hover:text-primary transition-all duration-200`}
            >
              <IconInfoCircleFilled size={28} strokeWidth={1.5} />
            </Link>
          </>
        )}

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={`hover:text-primary transition-all duration-300 ease-in-out`}
        >
          <IconSun size={24} strokeWidth={2} />
        </button>

        {authenticated ? (
          pathname === "/post/new" ? (
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
          )
        ) : (
          <IconInfoCircle />
        )}
      </section>
    </nav>
  );
}
