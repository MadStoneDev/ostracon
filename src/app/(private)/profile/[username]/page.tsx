import { createClient } from "@/utils/supabase/server";
import ProfileContent from "@/components/ui/profile-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const username = (await params).username;

  return {
    title: `${username} on Ostracon`,
    description: `The profile page for ${username}`,
  };
}

export default async function Profile({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  // Variables
  const username = (await params).username;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentUser = await supabase
    .from("users")
    .select(
      "id, username, avatar_url, bio, queued_for_delete, is_moderator, settings",
    )
    .eq("id", user!.id)
    .single();

  return (
    currentUser.data && (
      <ProfileContent
        user={currentUser.data}
        userId={currentUser.data.id}
        currentUserId={user?.id || ""}
      />
    )
  );
}
