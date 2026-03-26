import "./globals.css";

import React from "react";

import ThemeProvider from "@/components/ui/ThemeProvider";

import { Outfit, Merriweather, Lilita_One } from "next/font/google";

import MainNav from "@/components/ui/main-nav";
import CommandPalette from "@/components/ui/command-palette";
import { createClient } from "@/utils/supabase/server";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RealtimeProvider } from "@/providers/realtime-provider";
import ServiceWorkerRegister from "@/components/sw-register";

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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Ostracon" />
      </head>
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
            <RealtimeProvider userId={user?.id || null}>
              <TooltipProvider>
                <MainNav user={user} />
                {user && <CommandPalette username={username} />}

                {children}
                <Toaster />
                <ServiceWorkerRegister />
              </TooltipProvider>
            </RealtimeProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
