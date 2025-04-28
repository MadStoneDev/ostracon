import React from "react";

export const metadata = {
  title: "Conversation",
  description: "View conversation",
};

export default function ConversationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      {children}
    </div>
  );
}
