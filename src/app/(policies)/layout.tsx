import React from "react";

import BottomNav from "@/components/ui/bottom-nav";
import { createClient } from "@/utils/supabase/server";

export default async function PoliciesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userProfile = null;

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user!.id)
      .single();

    userProfile = profile;
  }

  return (
    <div className={`flex-grow flex flex-col overflow-y-auto`}>
      <main
        className={`${
          user && "mb-20"
        } px-4 md:px-6 flex-grow flex flex-col bg-light dark:bg-dark shadow-xl shadow-neutral-900/30`}
      >
        {children}
      </main>

      {user ? <BottomNav user={user} profile={userProfile} /> : null}
    </div>
  );
}
