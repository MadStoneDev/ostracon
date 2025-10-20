import ProfileContent from "@/components/ui/profile-content";

import {
  fetchCurrentUser,
  fetchProfileByUsername,
  fetchPostedFeedWithInteractions,
  fetchLikedFeedWithInteractions,
  fetchFollowers,
  fetchFollowing,
  fetchFollowStats,
  fetchUserSettings,
  fetchUserProfilesByIds,
  fetchDraftFeedWithInteractions,
} from "@/utils/supabase/fetch-supabase";

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
  const username = (await params).username;
  const profileData = await fetchProfileByUsername(username);

  // Get current user first, as we need their ID for interaction data
  const currentUser = await fetchCurrentUser();
  const currentUserId = currentUser?.id;

  // Use parallel fetching for better performance
  const [
    postedFeedWithInteractions,
    likedFeedWithInteractions,
    draftFeed,
    followStats,
    followers,
    following,
    settings,
  ] = await Promise.all([
    fetchPostedFeedWithInteractions(profileData.id, currentUserId, 0),
    fetchLikedFeedWithInteractions(profileData.id, currentUserId, 0),
    fetchDraftFeedWithInteractions(profileData.id, currentUserId, 0),
    fetchFollowStats(profileData.id),
    fetchFollowers(profileData.id),
    fetchFollowing(profileData.id),
    fetchUserSettings(),
  ]);

  // Extract user IDs, filtering out nulls
  const userIds =
    postedFeedWithInteractions
      ?.map((post) => post.user_id)
      .filter((id): id is string => id !== null && id !== undefined) || [];

  const likedUserIds =
    likedFeedWithInteractions
      ?.map((post) => post.user_id)
      .filter((id): id is string => id !== null && id !== undefined) || [];

  // Combine and deduplicate IDs
  const allUserIds = [...new Set([...userIds, ...likedUserIds])];

  // Now allUserIds is guaranteed to be string[]
  const userProfiles = await fetchUserProfilesByIds(allUserIds);

  return (
    currentUser && (
      <ProfileContent
        currentUser={currentUser}
        profile={profileData}
        postedFeed={postedFeedWithInteractions}
        likedFeed={likedFeedWithInteractions}
        draftsFeed={draftFeed}
        followStats={followStats}
        followers={followers}
        following={following}
        settings={settings}
        userProfiles={userProfiles}
      />
    )
  );
}
