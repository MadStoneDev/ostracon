import React from "react";
import BottomNav from "@/components/ui/bottom-nav";

export default function ExploreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}>) {
  return (
    <div
      className={`p-4 md:p-6 relative flex-grow grid bg-light dark:bg-dark overflow-hidden`}
    >
      <main className={`relative flex-grow flex justify-center`}>
        {children}
      </main>
    </div>
  );
}
