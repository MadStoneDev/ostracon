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
      <div
        className={`fixed top-0 w-full h-[60px] bg-light dark:bg-dark z-10`}
      ></div>

      <div className={`relative`}>{children}</div>

      {authenticated ? <BottomNav /> : null}
    </div>
  );
}
