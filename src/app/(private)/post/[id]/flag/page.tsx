import React from "react";
import FlagForm from "@/components/ui/flag-form";

export default async function FlagPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Variables
  const postId = (await params).id;

  return (
    <div className={`grid z-0`}>
      <section className={`pb-4 border-b border-dark/20 dark:border-light/20`}>
        <h1 className={`text-xl font-bold`}>Flag</h1>
      </section>

      <section
        className={`pt-4 pb-[70px] border-t border-dark/20 dark:border-light/20 transition-all duration-300 ease-in-out`}
      >
        <h2 className={`font-bold`}>Why are you flagging this post?</h2>
        <FlagForm postId={postId} />
      </section>
    </div>
  );
}
