import React from "react";
import BottomNav from "@/components/ui/bottom-nav";

export const metadata = {
  title: "Connect | Ostracon",
  description: "Discover and join communities on Ostracon to connect with like-minded people.",
};

export default function PrivateConnect({
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
