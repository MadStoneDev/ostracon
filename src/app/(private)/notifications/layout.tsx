import React from "react";
import BottomNav from "@/components/ui/bottom-nav";

export const metadata = {
  title: "Notifications | Ostracon",
  // TODO: Add description
  description: "Notifications page",
};

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authenticated = true;

  return (
    <div className={`relative flex-grow grid h-full overflow-hidden`}>
      <div className={`relative`}>{children}</div>
    </div>
  );
}
