import { createClient } from "@/utils/supabase/server";
import SearchResults from "@/components/search/search-results";

type SearchTab = "posts" | "users" | "communities" | "tags";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string }>;
}) {
  const { q = "", tab = "posts" } = await searchParams;
  const activeTab = (["posts", "users", "communities", "tags"].includes(tab)
    ? tab
    : "posts") as SearchTab;

  const supabase = await createClient();

  let posts: any[] = [];
  let users: any[] = [];
  let communities: any[] = [];
  let tags: any[] = [];

  if (q.trim()) {
    const query = `%${q.trim()}%`;

    switch (activeTab) {
      case "posts": {
        const { data } = await supabase
          .from("fragments")
          .select(
            "id, user_id, title, content, is_nsfw, comments_open, reactions_open, published_at, created_at, profiles!fragments_user_id_fkey(username, avatar_url)",
          )
          .eq("is_draft", false)
          .or(`content.ilike.${query},title.ilike.${query}`)
          .order("published_at", { ascending: false })
          .limit(20);
        posts = (data || []).map((row: any) => ({
          ...row,
          profiles: row.profiles || null,
        }));
        break;
      }
      case "users": {
        const { data } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .ilike("username", query)
          .limit(20);
        users = data || [];
        break;
      }
      case "communities": {
        const { data } = await supabase
          .from("communities")
          .select("id, name, display_name, description, member_count")
          .or(`name.ilike.${query},display_name.ilike.${query}`)
          .limit(20);
        communities = data || [];
        break;
      }
      case "tags": {
        const { data } = await supabase
          .from("tags")
          .select("id, tag, usage_count, colour")
          .ilike("tag", query)
          .limit(20);
        tags = data || [];
        break;
      }
    }
  }

  return (
    <div className="grid z-0 pb-[70px]">
      <section className="pb-4 border-b border-dark/20 dark:border-light/20">
        <h1 className="text-2xl font-bold">Search</h1>
      </section>

      <section className="pt-4">
        <SearchResults
          query={q}
          activeTab={activeTab}
          posts={posts}
          users={users}
          communities={communities}
          tags={tags}
        />
      </section>
    </div>
  );
}
