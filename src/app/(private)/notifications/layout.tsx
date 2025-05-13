import React from "react";

export const metadata = {
  title: "Notifications | Ostracon",
  // TODO: Add description
  description: "Notifications page",
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
