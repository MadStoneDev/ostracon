import React from "react";
import { redirect } from "next/navigation";

import BottomNav from "@/components/ui/bottom-nav";
import { createClient } from "@/utils/supabase/server";

export default async function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className={`relative flex-grow grid overflow-y-auto`}>
      <div
        className={`fixed top-0 w-full h-[60px] bg-light dark:bg-dark z-10`}
      ></div>

      <main className={`relative py-[80px] px-4 flex-grow`}>{children}</main>

      {user ? <BottomNav user={user} /> : null}
    </div>
  );
}
