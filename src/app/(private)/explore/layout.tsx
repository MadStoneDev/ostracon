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
    <div
      className={`flex-grow flex flex-col`}
      style={{
        padding: "70px 0",
      }}
    >
      <main className={`px-[25px] pt-5 flex-grow overflow-y-auto`}>
        {children}
      </main>

      {authenticated ? <BottomNav /> : null}
    </div>
  );
}
