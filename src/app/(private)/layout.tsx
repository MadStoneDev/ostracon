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

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  return (
    <div
      className={`flex-grow flex flex-col bg-white dark:bg-dark overflow-y-auto`}
    >
      <main className={`flex-grow flex flex-col p-6`}>{children}</main>

      {user ? <BottomNav user={user} profile={profile} /> : null}
    </div>
  );
}
