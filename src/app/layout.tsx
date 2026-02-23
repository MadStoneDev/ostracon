import "./globals.css";

import React from "react";

import ThemeProvider from "@/components/ui/ThemeProvider";

import { Outfit, Merriweather, Lilita_One } from "next/font/google";

import MainNav from "@/components/ui/main-nav";
import CommandPalette from "@/components/ui/command-palette";
import { createClient } from "@/utils/supabase/server";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "700", "800", "900"],
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username: string | undefined;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();
    username = profile?.username;
  }

  return (
    <html
      lang="en"
      className={`${outfit.variable} ${merriweather.variable} ${lilitaOne.variable}`}
      suppressHydrationWarning
    >
      <body
        className={`relative bg-primary dark:text-light text-dark`}
        style={{
          backgroundImage: `url('/ostracon-logo-background.jpg')`,
          backgroundRepeat: "repeat",
        }}
      >
        <ThemeProvider>
          {/*<div*/}
          {/*  className={`absolute top-0 right-0 bottom-0 left-0 bg-transparent dark:bg-neutral-900/40 transition-all duration-300 ease-in-out z-10`}*/}
          {/*></div>*/}
          <div
            className={`relative mx-auto flex flex-col min-h-dvh w-full max-w-4xl z-20`}
          >
            <TooltipProvider>
              <MainNav user={user} />
              {user && <CommandPalette username={username} />}

              {children}
              <Toaster />
            </TooltipProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
