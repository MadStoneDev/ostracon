import React from "react";
import Link from "next/link";

import { sampleUsers } from "@/data/sample-users";

export default function SingleUser({ userId }: { userId: string }) {
  const username = sampleUsers.find((user) => user.id === userId)?.username;
  const avatar_url = sampleUsers.find((user) => user.id === userId)?.avatar_url;

  return (
    <section className={`flex items-center gap-2`}>
      <article
        className={`w-10 h-10 rounded-full bg-dark dark:bg-light overflow-hidden`}
      >
        {avatar_url && (
          <img src={avatar_url} alt={`Avatar photo of ${username}`} />
        )}
      </article>

      <div className={`flex-grow inline-flex items-center`}>
        <Link
          href={`/profile/${username}`}
          className={`hover:opacity-65 transition-all duration-300 ease-in-out`}
        >
          <h3
            className={`max-w-[150px] xs:max-w-[250px] sm:max-w-full font-sans font-bold truncate`}
          >
            @{username || "Ghost_User"}
          </h3>
        </Link>
      </div>
    </section>
  );
}
