import "./globals.css";

import React from "react";

import ThemeProvider from "@/components/ui/ThemeProvider";

import { Outfit, Merriweather, Lilita_One } from "next/font/google";

import MainNav from "@/components/ui/main-nav";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "700"],
  variable: "--font-outfit",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-merriweather",
});
const lilitaOne = Lilita_One({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-lilita-one",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authenticated = true;

  return (
    <html
      lang="en"
      className={`${outfit.variable} ${merriweather.variable} ${lilitaOne.variable}`}
      suppressHydrationWarning
    >
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
