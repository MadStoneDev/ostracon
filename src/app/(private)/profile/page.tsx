import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function ProfileRedirect() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // TODO: Get logged in user from session
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
    // TODO: Fix no user found
    return <div>No user found</div>;
  }

  const username = checkUser.data!.username;

  redirect(`/profile/${username}`);
}
