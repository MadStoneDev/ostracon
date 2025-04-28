import React from "react";
import BottomNav from "@/components/ui/bottom-nav";

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}>) {
  return (
    <div className={`relative flex-grow grid overflow-hidden`}>
      <main className={`relative flex-grow flex justify-center`}>
        {children}
      </main>
    </div>
  );
}
