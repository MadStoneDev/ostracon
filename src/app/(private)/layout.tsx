import React from "react";

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}>) {
  const authenticated = true;

  return (
    <div className={`flex-grow flex flex-col`}>
      <main
        className={`flex-grow overflow-y-auto`}
        style={{
          padding: "60px 0",
        }}
      >
        <>
          {/* Header */}
          <section className={`relative mb-[75px] px-[25px] h-28 bg-dark`}>
            <article
              className={`absolute top-full -translate-y-1/2  w-36 h-36 rounded-full bg-dark border-[10px] border-light`}
            ></article>
          </section>

          {children}
        </>
      </main>

      {authenticated ? (
        <nav
          className={`fixed bottom-0 left-0 right-0 px-[25px] flex items-center bg-secondary`}
          style={{
            minHeight: "60px",
          }}
        ></nav>
      ) : null}
    </div>
  );
}
