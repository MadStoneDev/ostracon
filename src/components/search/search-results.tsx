"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";

import Post from "@/components/feed/single-post";
import SingleUser from "@/components/feed/single-user";
import { IconSearch } from "@tabler/icons-react";

type SearchTab = "posts" | "users" | "communities" | "tags";

type PostResult = {
  id: string;
  user_id: string | null;
  title: string | null;
  content: string | null;
  is_nsfw: boolean | null;
  comments_open: boolean | null;
  reactions_open: boolean | null;
  published_at: string | null;
  created_at: string | null;
  profiles?: {
    username: string;
    avatar_url: string | null;
  } | null;
};

type UserResult = {
  id: string;
  username: string;
  avatar_url: string | null;
};

type CommunityResult = {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  member_count: number | null;
};

type TagResult = {
  id: string;
  tag: string;
  usage_count: number | null;
  colour: string | null;
};

type SearchResultsProps = {
  query: string;
  activeTab: SearchTab;
  posts: PostResult[];
  users: UserResult[];
  communities: CommunityResult[];
  tags: TagResult[];
};

const tabs: { key: SearchTab; label: string }[] = [
  { key: "posts", label: "Posts" },
  { key: "users", label: "Users" },
  { key: "communities", label: "Communities" },
  { key: "tags", label: "Tags" },
];

export default function SearchResults({
  query,
  activeTab,
  posts,
  users,
  communities,
  tags,
}: SearchResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(query);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushSearch = useCallback(
    (q: string, tab?: SearchTab) => {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      params.set("tab", tab || activeTab);
      router.push(`/search?${params.toString()}`);
    },
    [router, activeTab],
  );

  const handleInputChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      pushSearch(value);
    }, 400);
  };

  const handleTabChange = (tab: SearchTab) => {
    pushSearch(searchInput, tab);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    pushSearch(searchInput);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const renderResults = () => {
    switch (activeTab) {
      case "posts":
        if (posts.length === 0)
          return <EmptyState message="No posts found" />;
        return (
          <div className="space-y-3">
            {posts.map((post) => (
              <Post
                key={post.id}
                postId={post.id}
                avatar_url={post.profiles?.avatar_url || ""}
                username={post.profiles?.username || ""}
                title={post.title || ""}
                content={post.content || ""}
                nsfw={post.is_nsfw || false}
                commentsAllowed={post.comments_open ?? true}
                reactionsAllowed={post.reactions_open ?? true}
                timestamp={post.published_at || post.created_at || ""}
                authorId={post.user_id || ""}
              />
            ))}
          </div>
        );

      case "users":
        if (users.length === 0)
          return <EmptyState message="No users found" />;
        return (
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="p-3 bg-neutral-200/70 dark:bg-neutral-50/10 rounded-lg"
              >
                <SingleUser userId={user.id} />
              </div>
            ))}
          </div>
        );

      case "communities":
        if (communities.length === 0)
          return <EmptyState message="No communities found" />;
        return (
          <div className="space-y-2">
            {communities.map((community) => (
              <Link
                key={community.id}
                href={`/connect/${community.name}`}
                className="block p-4 bg-neutral-200/70 dark:bg-neutral-50/10 rounded-lg hover:bg-neutral-300/70 dark:hover:bg-neutral-50/20 transition-all duration-300 ease-in-out"
              >
                <h3 className="font-sans font-bold text-lg">
                  {community.display_name}
                </h3>
                <p className="text-sm opacity-70 mt-1">
                  {community.description || "No description"}
                </p>
                {community.member_count !== null && (
                  <span className="text-xs opacity-50 mt-2 inline-block">
                    {community.member_count} members
                  </span>
                )}
              </Link>
            ))}
          </div>
        );

      case "tags":
        if (tags.length === 0)
          return <EmptyState message="No tags found" />;
        return (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/search?q=${encodeURIComponent(tag.tag)}&tab=posts`}
                className="px-3 py-1.5 rounded-full text-sm font-bold transition-all duration-300 ease-in-out hover:scale-105"
                style={{
                  backgroundColor: tag.colour
                    ? `${tag.colour}20`
                    : "rgb(var(--color-primary) / 0.1)",
                  color: tag.colour || "rgb(var(--color-primary))",
                  border: `1px solid ${tag.colour || "rgb(var(--color-primary) / 0.3)"}`,
                }}
              >
                #{tag.tag}
                {tag.usage_count !== null && (
                  <span className="ml-1 opacity-60">({tag.usage_count})</span>
                )}
              </Link>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="grid gap-4">
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <IconSearch
          size={20}
          className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40"
        />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Search posts, users, communities, tags..."
          className="w-full pl-10 pr-4 py-3 bg-neutral-200/70 dark:bg-neutral-50/10 rounded-lg border border-dark/10 dark:border-light/10 focus:outline-none focus:border-primary transition-all duration-300 ease-in-out"
        />
      </form>

      {/* Tab Bar */}
      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ease-in-out ${
              activeTab === tab.key
                ? "bg-primary text-light"
                : "bg-neutral-200/70 dark:bg-neutral-50/10 hover:bg-neutral-300 dark:hover:bg-neutral-50/20"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {query ? (
        renderResults()
      ) : (
        <div className="p-8 text-center opacity-50">
          <IconSearch size={48} className="mx-auto mb-4 opacity-30" />
          <p>Enter a search term to find posts, users, communities, and tags.</p>
        </div>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="p-8 text-center">
      <p className="text-gray-500">{message}</p>
    </div>
  );
}
