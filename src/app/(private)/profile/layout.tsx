import React from "react";
import BottomNav from "@/components/ui/bottom-nav";
import OstraconAction from "@/components/ui/ostracon-action";

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

      <main
        className={`relative pt-[100px] pb-[60px] px-[25px] flex-grow overflow-y-auto`}
      >
        {children}
      </main>

      {authenticated ? <BottomNav /> : null}
    </div>
  );
}
