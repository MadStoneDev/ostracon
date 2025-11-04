import React from "react";
import BottomNav from "@/components/ui/bottom-nav";
import OstraconAction from "@/components/ui/ostracon-action";

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authenticated = true;

  return <div className={`flex-grow flex flex-col h-full`}>{children}</div>;
}
