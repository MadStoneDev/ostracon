import React from "react";
import SingleUser from "@/components/feed/single-user";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

// Define interface for the params
interface PageParams {
  id: string;
}

async function getLikedBy(postId: string) {
  const supabase = await createClient();

  const { data: likedBy, error } = await supabase
    .from("fragment_reactions")
    .select("user_id")
    .eq("fragment_id", postId)
    .eq("type", "like");

  if (error) {
    console.error("Error fetching liked by:", error);
    return [];
  }

  return likedBy || [];
}

export default async function Page({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const postId = (await params).id;
  const likers = await getLikedBy(postId);

  return (
    <div className={`grid z-0`}>
      <section className={`pb-4 border-b`}>
        <h1 className={`text-xl font-bold`}>Liked By</h1>
        <Link
          href={`/post/${postId}`}
          className={`mt-2 flex items-center gap-1 text-neutral-500 hover:text-primary text-sm transition-all duration-300 ease-in-out`}
        >
          <IconArrowLeft size={18} strokeWidth={1.5} /> Back to Post
        </Link>
      </section>

      <section className={`pb-[70px] transition-all duration-300 ease-in-out`}>
        {likers.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No likes yet</div>
        ) : (
          likers.map((liker: { user_id: string | null }) => {
            return (
              <div
                key={`liking-${liker.user_id}`}
                className={`py-4 border-b border-dark/5 dark:border-light/5`}
              >
                <SingleUser userId={liker.user_id} />
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
