import "./globals.css";

import { Lato as Sans, Merriweather as Serif } from "next/font/google";

import React from "react";
import type { Metadata } from "next";

import ThemeProvider from "@/components/ui/ThemeProvider";
import MainNav from "@/components/ui/main-nav";
import OstraconAction from "@/components/ui/ostracon-action";

const sans = Sans({
  weight: ["100", "300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-sans",
});

const serif = Serif({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-serif",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authenticated = true;

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <div
            className={`flex flex-col min-h-dvh justify-between dark:bg-dark bg-light dark:text-light text-dark overflow-hidden`}
          >
            <MainNav authenticated={authenticated} />

            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
