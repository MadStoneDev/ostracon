import React from "react";
import BottomNav from "@/components/ui/bottom-nav";

export default function PostLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authenticated = true;

  return (
    <div className={`flex-grow pb-[70px] flex flex-col h-full overflow-hidden`}>
      {children}
    </div>
  );
}
