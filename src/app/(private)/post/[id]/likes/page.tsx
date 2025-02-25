import React from "react";
import SingleUser from "@/components/feed/single-user";

import { createClient } from "@/utils/supabase/client";

async function getLikedBy(postId: string) {
  const supabase = createClient();

  const { data: likedBy, error } = await supabase
    .from("reactions")
    .select("user_id")
    .eq("post_id", postId);

  if (error) {
    console.error("Error fetching liked by:", error);
    return [];
  }

  return likedBy;
}

export default async function Likes({ params }: { params: { id: string } }) {
  const postId = params.id;
  const likers = await getLikedBy(postId);

  return (
    <div className={`grid z-0`}>
      <section className={`pb-4 border-b`}>
        <h1 className={`text-xl font-bold`}>Liked By</h1>
      </section>

      <section className={`pb-[70px] transition-all duration-300 ease-in-out`}>
        {likers.map((id) => {
          return (
            <div
              key={`listening-${id}`}
              className={`py-4 border-b border-dark/5 dark:border-light/5`}
            >
              <SingleUser userId={id} />
            </div>
          );
        })}
      </section>
    </div>
  );
}
