import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function ProfileRedirect() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentUser = user ? user.id : null;

  // Get username from Supabase public.users table
  if (!currentUser) {
    return <div>No user found</div>;
  }

  const checkUser = await supabase
    .from("profiles")
    .select("username")
    .eq("id", currentUser)
    .single();

  if (!checkUser) {
    return <div>No user found</div>;
  }

  const username = checkUser.data!.username;

  redirect(`/profile/${username}`);
}
