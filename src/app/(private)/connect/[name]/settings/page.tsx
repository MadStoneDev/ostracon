import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { CommunitySettingsForm } from "@/components/communities/community-settings-form";
import { CommunityRulesEditor } from "@/components/communities/community-rules-editor";
import { CommunityMemberManagement } from "@/components/communities/community-member-management";
import { DeleteCommunityButton } from "@/components/communities/community-delete-button";
import { CommunityPendingRequests } from "@/components/communities/community-pending-requests";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface CommunitySettingsPageProps {
  params: Promise<{
    name: string;
  }>;
}

export async function generateMetadata({ params }: CommunitySettingsPageProps) {
  const { name } = await params;
  const supabase = await createClient();

  const { data: community } = await supabase
    .from("communities")
    .select("display_name")
    .eq("name", name)
    .single();

  return {
    title: `Settings - ${community?.display_name || name} | Ostracon`,
  };
}

export default async function CommunitySettingsPage({
  params,
}: CommunitySettingsPageProps) {
  const { name } = await params;
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Fetch community
  const { data: community, error } = await supabase
    .from("communities")
    .select("*")
    .eq("name", name)
    .single();

  if (error || !community) {
    notFound();
  }

  // Check if user is admin/moderator
  const { data: membership } = await supabase
    .from("community_members")
    .select("role")
    .eq("community_id", community.id)
    .eq("user_id", user.id)
    .single();

  const canEdit =
    membership?.role === "admin" || membership?.role === "moderator";

  if (!canEdit) {
    redirect(`/connect/${name}`);
  }

  // Fetch all members with profiles
  const { data: members } = await supabase
    .from("community_members")
    .select(
      `
      *,
      profiles (
        id,
        username,
        avatar_url
      )
    `,
    )
    .eq("community_id", community.id)
    .order("joined_at", { ascending: true });

  // Fetch pending join requests (for private communities)
  const { data: joinRequestsRaw } = await supabase
    .from("community_join_requests")
    .select(
      `
      *,
      profiles (
        username,
        avatar_url,
        bio
      )
    `,
    )
    .eq("community_id", community.id)
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  // Map to format expected by CommunityPendingRequests
  const joinRequests = (joinRequestsRaw || []).map((r) => ({
    ...r,
    requested_at: r.created_at,
  }));

  // Parse rules from JSONB
  const rules = Array.isArray(community.rules) ? community.rules : [];

  // Get role counts
  const adminCount = members?.filter((m) => m.role === "admin").length || 0;
  const modCount = members?.filter((m) => m.role === "moderator").length || 0;
  const memberCount = members?.filter((m) => m.role === "member").length || 0;

  return (
    <div className="flex flex-col gap-6 p-4 max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        href={`/connect/${name}`}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {community.display_name}
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Community Settings</h1>
        <p className="text-muted-foreground">{community.display_name}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm px-2 py-1 bg-primary/10 text-primary rounded-full">
            {membership?.role}
          </span>
          {user.id === community.created_by && (
            <span className="text-sm px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
              Creator
            </span>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="border rounded-lg p-4">
        <h2 className="font-semibold mb-4">Community Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-muted rounded-md">
            <p className="text-2xl font-bold">{members?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Total Members</p>
          </div>
          <div className="p-3 bg-muted rounded-md">
            <p className="text-2xl font-bold">{adminCount}</p>
            <p className="text-sm text-muted-foreground">Admins</p>
          </div>
          <div className="p-3 bg-muted rounded-md">
            <p className="text-2xl font-bold">{modCount}</p>
            <p className="text-sm text-muted-foreground">Moderators</p>
          </div>
          <div className="p-3 bg-muted rounded-md">
            <p className="text-2xl font-bold">{memberCount}</p>
            <p className="text-sm text-muted-foreground">Members</p>
          </div>
        </div>
      </div>

      {/* Pending Join Requests (private communities) */}
      {community.join_type === "private" && (joinRequests?.length ?? 0) > 0 && (
        <CommunityPendingRequests
          communityName={name}
          requests={joinRequests || []}
        />
      )}

      {/* Basic Settings */}
      <CommunitySettingsForm community={community} />

      {/* Community Rules */}
      <div className="border rounded-lg p-4">
        <h2 className="font-semibold mb-4">Community Rules</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Set clear rules for your community members to follow.
        </p>
        <CommunityRulesEditor communityName={name} initialRules={rules} />
      </div>

      {/* Member Management */}
      <div className="border rounded-lg p-4">
        <h2 className="font-semibold mb-4">Member Management</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Manage community members, assign roles, and remove members.
        </p>
        <CommunityMemberManagement
          communityName={name}
          members={members || []}
          currentUserRole={membership?.role || "member"}
          currentUserId={user.id}
          createdBy={community.created_by}
        />
      </div>

      {/* Danger Zone */}
      <div className="border border-red-200 rounded-lg p-4">
        <h2 className="font-semibold mb-4 text-red-600">Danger Zone</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Permanently delete this community. This action cannot be undone. All
          posts, members, and data will be lost.
        </p>
        {user.id === community.created_by ? (
          <DeleteCommunityButton
            communityName={name}
            communityDisplayName={community.display_name}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Only the community creator can delete the community.
          </p>
        )}
      </div>
    </div>
  );
}
