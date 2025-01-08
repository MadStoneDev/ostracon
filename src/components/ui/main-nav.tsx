"use client";

import Link from "next/link";
import { useTheme } from "next-themes";

import {
  IconInfoCircleFilled,
  IconSettings,
  IconSettings2,
  IconSun,
  IconSunFilled,
  IconTool,
} from "@tabler/icons-react";

export default function MainNav({
  authenticated = false,
}: {
  authenticated?: boolean;
}) {
  const { theme, setTheme } = useTheme();

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
        <Link href={`/`}>Ostracon</Link>
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
          className={`transition-all duration-200`}
        >
          <IconSun size={24} strokeWidth={2} />
        </button>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={`transition-all duration-200`}
        >
          <IconTool size={22} strokeWidth={2} />
        </button>
      </section>
    </nav>
  );
}
