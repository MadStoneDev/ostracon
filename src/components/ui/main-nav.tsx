"use client";

import Link from "next/link";
import { useTheme } from "next-themes";

import {
  IconInfoCircleFilled,
  IconSun,
  IconSunFilled,
} from "@tabler/icons-react";

export default function MainNav({
  authenticated = false,
}: {
  authenticated?: boolean;
}) {
  const { theme, setTheme } = useTheme();

  return (
    <nav
      className={`fixed top-0 left-0 right-0 px-[25px] flex justify-between items-stretch gap-10 bg-light dark:bg-dark z-50`}
      style={{
        minHeight: "60px",
      }}
    >
      <section
        className={`flex items-center font-serif font-black text-sm uppercase`}
      >
        <Link href={`/`}>Ostracon</Link>
      </section>

      <section className={`flex-grow flex justify-end items-center gap-2`}>
        {authenticated ? null : (
          <>
            <Link
              href={`/info`}
              className={`hover:text-primary transition-all duration-200`}
            >
              <IconInfoCircleFilled size={28} strokeWidth={1.5} />
            </Link>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`hover:text-primary transition-all duration-200`}
            >
              <IconSunFilled size={28} strokeWidth={1.5} />
            </button>
          </>
        )}
      </section>
    </nav>
  );
}
