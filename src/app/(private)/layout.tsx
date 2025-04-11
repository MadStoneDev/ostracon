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
    .from("users")
    .select("*")
    .eq("id", user!.id)
    .single();

  return (
    <div className={`px-4 md:px-6 flex-grow flex flex-col overflow-y-auto`}>
      <main className={`flex-grow flex flex-col`}>{children}</main>

      {user ? <BottomNav user={user} profile={profile} /> : null}
    </div>
  );
}
