import React from "react";

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
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
        {children}
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
