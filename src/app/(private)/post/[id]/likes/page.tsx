import { sampleUsers } from "@/data/sample-users";
import SingleUser from "@/components/feed/single-user";
import React from "react";

export default function Likes() {
  return (
    <div className={`grid z-0`}>
      <section className={`pb-4 border-b`}>
        <h1 className={`text-xl font-bold`}>Liked By</h1>
      </section>

      <section className={`pb-[70px] transition-all duration-300 ease-in-out`}>
        {sampleUsers.map((user) => {
          return (
            <div
              key={`listening-${user.id}`}
              className={`py-4 border-b border-dark/5 dark:border-light/5`}
            >
              <SingleUser userId={user.id} />
            </div>
          );
        })}
      </section>
    </div>
  );
}
