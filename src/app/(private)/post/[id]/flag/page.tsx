import React from "react";

import Post from "@/components/feed/single-post";
import RadioGroup from "@/components/ui/radio-group";

import SamplePosts from "@/data/sample-posts";
import { sampleUsers } from "@/data/sample-users";
import FlagForm from "@/components/ui/flag-form";

export default async function FlagPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Variables
  const postId = (await params).id;
  const post = SamplePosts.find((post) => post.id === postId);

  if (!post) {
    return <span className={`text-sm italic`}>Post not found</span>;
  }

  const username = sampleUsers.find((user) => user.id === post.user_id)
    ?.username;

  const avatar_url = sampleUsers.find((user) => user.id === post.user_id)
    ?.avatar_url;

  return (
    <div className={`grid z-0`}>
      <section className={`pb-4 border-b border-dark/20 dark:border-light/20`}>
        <h1 className={`text-xl font-bold`}>Flag</h1>
      </section>

      <section className={`pt-2 py-0 scale-90 opacity-70`}>
        <Post
          postId={`${postId}`}
          avatar_url={avatar_url || ""}
          username={username || "Ghost User"}
          content={post.content}
          nsfw={post.is_nsfw}
          timestamp={post.created_at}
          referenceOnly={true}
        />
      </section>

      <section
        className={`pt-4 pb-[70px] border-t border-dark/20 dark:border-light/20 transition-all duration-300 ease-in-out`}
      >
        <h2 className={`font-bold`}>Why are you flagging this post?</h2>
        <FlagForm />
      </section>
    </div>
  );
}
