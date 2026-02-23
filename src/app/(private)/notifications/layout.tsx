import React from "react";

export const metadata = {
  title: "Notifications | Ostracon",
  description: "View your latest notifications including reactions, comments, and new followers.",
};

export default function NotificationsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`relative flex-grow grid h-full overflow-hidden`}>
      <div className={`relative`}>{children}</div>
    </div>
  );
}
