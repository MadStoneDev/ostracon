import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

interface CommunityPageProps {
  params: Promise<{
    name: string;
  }>;
}

export async function generateMetadata({ params }: CommunityPageProps) {
  const { name } = await params;
  const supabase = await createClient();

  const { data: community } = await supabase
    .from("communities")
    .select("display_name, description")
    .eq("name", name)
    .single();

  if (!community) {
    return {
      title: "Community Not Found | Ostracon",
    };
  }

  return {
    title: `${community.display_name} | Ostracon`,
    description:
      community.description ||
      `Join the ${community.display_name} community on Ostracon`,
  };
}

export default async function CommunityPage({ params }: CommunityPageProps) {
  const { name } = await params;
  const supabase = await createClient();

  // Fetch community by name (not id!)
  const { data: community, error } = await supabase
    .from("communities")
    .select(
      `
      *,
      created_by:profiles!communities_created_by_fkey(
        id,
        username,
        avatar_url
      )
    `,
    )
    .eq("name", name)
    .single();

  if (error || !community) {
    notFound();
  }

  // Check if current user is a member
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isMember = false;
  let memberRole = null;

  if (user) {
    const { data: membership } = await supabase
      .from("community_members")
      .select("role")
      .eq("community_id", community.id)
      .eq("user_id", user.id)
      .single();

    isMember = !!membership;
    memberRole = membership?.role;
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Community Header */}
      <div>
        <h1 className="text-3xl font-bold">{community.display_name}</h1>
        <p className="text-muted-foreground">/connect/{community.name}</p>
        {community.description && (
          <p className="mt-2">{community.description}</p>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          {community.member_count} members
        </p>
      </div>

      {/* Membership Status */}
      {user && (
        <div>
          {isMember ? (
            <p className="text-sm text-green-600">
              You're a member {memberRole !== "member" && `(${memberRole})`}
            </p>
          ) : (
            <form action={`/api/communities/${name}/join`} method="POST">
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
              >
                Join Community
              </button>
            </form>
          )}
        </div>
      )}

      {/* Community Feed */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
        <p className="text-muted-foreground">Community feed coming soon...</p>
      </div>
    </div>
  );
}
