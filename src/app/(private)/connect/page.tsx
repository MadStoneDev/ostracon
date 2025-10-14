import { createClient } from "@/utils/supabase/server";
import { CreateCommunityModal } from "@/components/communities/create-community-modal";

export const metadata = {
  title: "Communities | Ostracon",
  description: "Discover and join communities on Ostracon",
};

export default async function CommunitiesPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch communities ordered by member count
  const { data: communities, error } = await supabase
    .from("communities")
    .select(
      `
      id,
      name,
      display_name,
      description,
      avatar_url,
      is_nsfw,
      member_count
    `,
    )
    .order("member_count", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching communities:", error);
  }

  return (
    <div className="grid gap-6 p-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Communities</h1>
          <p className="text-muted-foreground">
            Discover communities and connect with people who share your
            interests
          </p>
        </div>

        {/* Only show create button if authenticated */}
        {user && <CreateCommunityModal />}
      </div>

      {/* TODO: Add search/filter functionality */}

      {communities && communities.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {communities.map((community) => (
            <a
              key={community.id}
              href={`/connect/${community.name}`}
              className="border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
            >
              {community.avatar_url && (
                <img
                  src={community.avatar_url}
                  alt={community.display_name}
                  className="w-full h-32 object-cover rounded-md mb-3"
                />
              )}
              <h3 className="font-semibold">{community.display_name}</h3>
              <p className="text-sm text-muted-foreground">
                /connect/{community.name}
              </p>
              {community.description && (
                <p className="text-sm mt-2 line-clamp-2">
                  {community.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {community.member_count}{" "}
                {community.member_count === 1 ? "member" : "members"}
              </p>
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No communities yet. Be the first to create one!
          </p>
        </div>
      )}
    </div>
  );
}
