"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import PostEditor from "@/components/feed/post-editor";

import {
  IconEyeOff,
  IconHeart,
  IconHeartFilled,
  IconMessage,
  IconMessageFilled,
  IconSend,
} from "@tabler/icons-react";

export default function NewPost() {
  // Hooks
  const router = useRouter();

  // States
  const [postContent, setPostContent] = useState("");
  const [allowReactions, setAllowReactions] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [postNSFW, setPostNSFW] = useState(false);

  // Functions
  const handleDefaultSettings = (setting: string) => {
    const fromLocalStorage = JSON.parse(
      localStorage.getItem("defaultPostSettings") || "{}",
    );

    switch (setting) {
      case "allowReactions":
        fromLocalStorage["allowReactions"] = !allowReactions;
        setAllowReactions(!allowReactions);
        break;
      case "allowComments":
        fromLocalStorage["allowComments"] = !allowComments;
        setAllowComments(!allowComments);
        break;
      case "postNSFW":
        fromLocalStorage["postNSFW"] = !postNSFW;
        setPostNSFW(!postNSFW);
        break;
      default:
        break;
    }

    localStorage.setItem(
      "defaultPostSettings",
      JSON.stringify(fromLocalStorage),
    );
  };

  // Effects
  useEffect(() => {
    const checkLocalStorage = localStorage.getItem("defaultPostSettings");

    if (checkLocalStorage) {
      const fromLocalStorage = JSON.parse(checkLocalStorage);
      console.log(fromLocalStorage);
      setAllowReactions(fromLocalStorage["allowReactions"] ?? true);
      setAllowComments(fromLocalStorage["allowComments"] ?? true);
      setPostNSFW(fromLocalStorage["postNSFW"] ?? false);
    } else {
      localStorage.setItem(
        "defaultPostSettings",
        JSON.stringify({
          allowReactions: true,
          allowComments: true,
          postNSFW: false,
        }),
      );
    }
  }, []);

  return (
    <div className={`flex-grow flex flex-col h-full`}>
      <div className={`relative flex-grow flex flex-col`}>
        {/* Header */}
        <section className={`relative`}>
          <article className={`pb-4 flex gap-2`}>
            <h1
              className={`font-sans font-black text-xl text-dark dark:text-light`}
            >
              What do you want to share?
            </h1>
          </article>

          {/* Send Button */}
          <button
            className={`absolute top-1 right-0 text-dark dark:text-light hover:text-primary dark:hover:text-primary disabled:pointer-events-none disabled:opacity-50 transition-all duration-300 ease-in-out`}
            disabled={postContent.replace(/(<([^>]+)>)/gi, "").length === 0}
          >
            <IconSend size={24} strokeWidth={2} />
          </button>
        </section>

        {/* Post Editor */}
        <article className={`relative grow flex flex-col text-sm`}>
          <PostEditor />
        </article>
      </div>

      {/* Communities */}
      {/* TODO: Implement Communities */}
      <article className={``}></article>

      {/* Side Bar*/}
      <aside
        className={`px-2 py-3 fixed top-1/2 -translate-y-1/2 right-0 flex flex-col gap-5 bg-dark text-primary dark:bg-light rounded-l-xl`}
      >
        <button
          className={`relative flex-grow flex justify-center items-center h-full`}
          onClick={() => handleDefaultSettings("allowReactions")}
        >
          <div
            className={`${
              allowReactions ? "opacity-100" : "opacity-50"
            } transition-all duration-300 ease-in-out`}
          >
            {allowReactions ? (
              <IconHeartFilled size={24} strokeWidth={2} />
            ) : (
              <IconHeart size={24} strokeWidth={2} />
            )}
          </div>
        </button>

        <button
          className={`relative flex-grow flex justify-center items-center h-full`}
          onClick={() => handleDefaultSettings("allowComments")}
        >
          <div
            className={`${
              allowComments ? "opacity-100" : "opacity-50"
            } transition-all duration-300 ease-in-out`}
          >
            {allowComments ? (
              <IconMessageFilled size={24} strokeWidth={2} />
            ) : (
              <IconMessage size={24} strokeWidth={2} />
            )}
          </div>
        </button>

        <button
          className={`flex-grow flex justify-center items-center gap-1 h-full ${
            postNSFW ? "opacity-100" : "opacity-50"
          } transition-all duration-300 ease-in-out`}
          onClick={() => handleDefaultSettings("postNSFW")}
        >
          <IconEyeOff size={24} strokeWidth={2} />
        </button>
      </aside>

      {/*  Footer*/}
      <footer className={`py-4 flex flex-col text-xs`}>
        {!allowReactions && <p>Reactions have been disabled for this post.</p>}
        {!allowComments && <p>Comments have been disabled for this post.</p>}
        {postNSFW && (
          <p>
            Thank you for keeping our community safe by marking this post as
            sensitive.
          </p>
        )}
      </footer>
    </div>
  );
}
