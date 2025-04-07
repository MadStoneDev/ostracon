import React from "react";
import BottomNav from "@/components/ui/bottom-nav";

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}>) {
  const authenticated = true;

  return (
    <div className={`relative flex-grow grid overflow-hidden`}>
      <div
        className={`fixed top-0 w-full h-[60px] bg-light dark:bg-dark z-10`}
      ></div>

      <main className={`relative flex-grow flex justify-center`}>
        {children}
      </main>

      {authenticated ? <BottomNav /> : null}
    </div>
  );
}
