import React from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import NewConversationForm from "@/components/messages/new-conversation-form";

export default async function NewConversationPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    console.error("Error fetching profile:", profileError);
    return <div>Error loading profile</div>;
  }

  // Get users the current user is following (potential recipients)
  const { data: following, error: followingError } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id);

  if (followingError) {
    console.error("Error fetching following:", followingError);
    return <div>Error loading following list</div>;
  }

  const followingIds = following?.map((f) => f.following_id) || [];

  // Get user profiles
  const { data: userProfiles, error: userProfilesError } = await supabase
    .from("users")
    .select("id, username, avatar_url")
    .in("id", followingIds);

  if (userProfilesError) {
    console.error("Error fetching user profiles:", userProfilesError);
    return <div>Error loading user profiles</div>;
  }

  return (
    <div className={`pb-[90px] h-full`}>
      <NewConversationForm
        currentUser={user}
        userProfiles={userProfiles || []}
      />
    </div>
  );
}
