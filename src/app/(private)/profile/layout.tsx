import React from "react";
import BottomNav from "@/components/ui/bottom-nav";
import OstraconAction from "@/components/ui/ostracon-action";

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}>) {
  const authenticated = true;

  return (
    <div
      className={`flex-grow flex flex-col`}
      style={{
        padding: "60px 0",
      }}
    >
      <main className={`flex-grow overflow-y-auto`}>
        {/* Header */}
        <section
          className={`relative mb-[75px] px-[25px] h-28 bg-dark dark:bg-light`}
        >
          <article
            className={`absolute top-full -translate-y-1/2  w-36 h-36 rounded-full bg-dark dark:bg-light border-[10px] border-light dark:border-dark`}
          ></article>
        </section>

        {children}
      </main>

      <OstraconAction />

      {authenticated ? <BottomNav /> : null}
    </div>
  );
}
