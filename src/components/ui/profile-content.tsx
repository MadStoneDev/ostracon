"use client";

import React, { useEffect, useState } from "react";

import Post from "@/components/feed/single-post";
import BigButton from "@/components/ui/big-button";
import { motion, AnimatePresence } from "framer-motion";

import { IconHeartFilled, IconNotes } from "@tabler/icons-react";
import samplePosts from "@/data/sample-posts";
import { PostFragment } from "@/types/fragments";
import { sampleUsers } from "@/data/sample-users";
import SingleUser from "@/components/feed/single-user";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    zIndex: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -1000 : 1000,
    opacity: 0,
    zIndex: 0,
  }),
};

const PostedFeed = ({
  username,
  userId,
}: {
  username: string;
  userId: string;
}) => {
  const [posts, setPosts] = useState<PostFragment[]>([]);

  useEffect(() => {
    setPosts(samplePosts.filter((post) => post.user_id === userId));
  }, [samplePosts, userId]);

  return (
    <section className={`grid`}>
      {posts.map((post) => {
        const username = sampleUsers.find((user) => user.id === post.user_id)
          ?.username;

        const avatar_url = sampleUsers.find((user) => user.id === post.user_id)
          ?.avatar_url;

        return (
          <article
            key={`feed-post-${post.id}`}
            className={`pb-[60px] border-b last-of-type:border-b-0 border-dark/10 dark:border-light/10 transition-all duration-300 ease-in-out`}
          >
            <Post
              postId={`${post.id}`}
              avatar_url={avatar_url || ""}
              username={username || "Ghost User"}
              content={post.content}
              nsfw={post.is_nsfw}
              timestamp={post.created_at}
            />
          </article>
        );
      })}
    </section>
  );
};

const LikedFeed = ({
  username,
  userId,
}: {
  username: string;
  userId: string;
}) => {
  const [posts, setPosts] = useState<PostFragment[]>([]);

  useEffect(() => {
    setPosts(samplePosts.filter((post) => post.user_id === userId));
  }, [samplePosts, userId]);

  return (
    <section className={`grid`}>
      {posts.map((post) => {
        const username = sampleUsers.find((user) => user.id === post.user_id)
          ?.username;

        const avatar_url = sampleUsers.find((user) => user.id === post.user_id)
          ?.avatar_url;

        return (
          <article
            key={`feed-post-${post.id}`}
            className={`pb-[60px] border-b last-of-type:border-b-0 border-dark/10 dark:border-light/10 transition-all duration-300 ease-in-out`}
          >
            <Post
              postId={`${post.id}`}
              avatar_url={avatar_url || ""}
              username={username || "Ghost User"}
              content={post.content}
              nsfw={post.is_nsfw}
              timestamp={post.created_at}
            />
          </article>
        );
      })}
    </section>
  );
};

const ListeningFeed = ({
  username,
  userId,
}: {
  username: string;
  userId: string;
}) => {
  return (
    <section className={`pb-[60px] transition-all duration-300 ease-in-out`}>
      {sampleUsers.map((user) => {
        return (
          <div
            key={`listening-${user.id}`}
            className={`py-3 border-b border-dark/10 dark:border-light/10`}
          >
            <SingleUser userId={user.id} />
          </div>
        );
      })}
    </section>
  );
};

const ListenersFeed = ({
  username,
  userId,
}: {
  username: string;
  userId: string;
}) => {
  return (
    <section className={`pb-[60px] transition-all duration-300 ease-in-out`}>
      {sampleUsers.map((user) => {
        return (
          <div
            key={`listener-${user.id}`}
            className={`py-3 border-b border-dark/10 dark:border-light/10`}
          >
            <SingleUser userId={user.id} />
          </div>
        );
      })}
    </section>
  );
};

export default function ProfileContent({
  username,
  userId,
}: {
  username: string;
  userId: string;
}) {
  // States
  const [[activeTab, direction], setActiveTab] = useState(["Posted", 0]);
  const [prevTab, setPrevTab] = useState("Posted");

  // Functions
  const updateTab = (newTab: string) => {
    const tabOrder = ["Posts", "Likes", "Listening", "Listeners"];
    const currentIndex = tabOrder.indexOf(activeTab);
    const newIndex = tabOrder.indexOf(newTab);
    const newDirection = newIndex > currentIndex ? 1 : -1;

    setPrevTab(newTab);
    setActiveTab([newTab, newDirection]);
  };

  const getFeedContent = () => {
    switch (activeTab) {
      case "Likes":
        return <LikedFeed username={username} userId={userId} />;
      case "Listening":
        return <ListeningFeed username={username} userId={userId} />;
      case "Listeners":
        return <ListenersFeed username={username} userId={userId} />;
      case "Posts":
      default:
        return <PostedFeed username={username} userId={userId} />;
    }
  };

  // Variables
  const thisUser = sampleUsers.find((user) => user.id === userId);

  // TODO: Handle no user found better
  if (!thisUser) return <></>;

  const avatar_url = thisUser.avatar_url;
  const bio = thisUser.bio;
  const avatar = thisUser.avatar_url;

  return (
    <div className={`grid`}>
      {/* Header */}
      <section>
        {/* Avatar */}
        <article
          className={`relative w-32 h-32 rounded-full bg-dark dark:bg-light overflow-hidden`}
        >
          {avatar_url ? (
            <img src={avatar_url} alt={`Avatar photo of ${username}`} />
          ) : (
            <div
              className={`absolute left-0 top-0 right-0 bottom-0 grid place-content-center`}
            >
              <span className={`text-6xl font-accent text-primary`}>
                {username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </article>

        {/* User Info */}
        <article className={`mt-2 mb-8 grid gap-3`}>
          <h1 className={`font-sans text-3xl text-primary font-black`}>
            {username}
          </h1>
          <p className={`opacity-75 font-normal`}>{bio}</p>
        </article>

        {/* Tabs */}
        <article className={`flex flex-col justify-center gap-2 text-sm`}>
          <div className={`flex flex-wrap gap-x-1 gap-y-2`}>
            <button
              className={`group flex items-center rounded-full hover:bg-white hover:text-primary/65 overflow-hidden transition-all duration-300 ease-in-out`}
              onClick={() => updateTab("Posts")}
            >
              <span
                className={`px-2 py-1 border rounded-full ${
                  activeTab === "Posts"
                    ? "text-light border-primary bg-primary"
                    : "group-hover:bg-primary/65 text-dark dark:text-light border-dark dark:border-light"
                } transition-all duration-300 ease-in-out`}
              >
                Posts
              </span>
            </button>

            <button
              className={`group flex items-center rounded-full hover:bg-white hover:text-primary/65 overflow-hidden transition-all duration-300 ease-in-out`}
              onClick={() => updateTab("Likes")}
            >
              <span
                className={`px-2 py-1 border rounded-full ${
                  activeTab === "Likes"
                    ? "text-light border-primary bg-primary"
                    : "group-hover:bg-primary/65 text-dark dark:text-light border-dark dark:border-light"
                } transition-all duration-300 ease-in-out`}
              >
                Likes
              </span>
            </button>
          </div>

          <div className={`flex flex-wrap gap-x-1 gap-y-2`}>
            <button
              className={`group flex items-center rounded-full hover:bg-white hover:text-primary/65 overflow-hidden transition-all duration-300 ease-in-out`}
              onClick={() => updateTab("Listening")}
            >
              <span
                className={`px-2 py-1 bg-dark dark:bg-light rounded-l-full border border-dark dark:border-light text-light dark:text-dark font-bold transition-all duration-300 ease-in-out`}
              >
                150
              </span>
              <span
                className={`px-2 py-1 border rounded-r-full ${
                  activeTab === "Listening"
                    ? "text-light border-primary bg-primary"
                    : "group-hover:bg-primary/65 text-dark dark:text-light border-dark dark:border-light"
                } transition-all duration-300 ease-in-out`}
              >
                Listening
              </span>
            </button>

            <button
              className={`group flex items-center rounded-full hover:bg-white hover:text-primary/65 overflow-hidden transition-all duration-300 ease-in-out`}
              onClick={() => updateTab("Listeners")}
            >
              <span
                className={`px-2 py-1 bg-dark dark:bg-light rounded-l-full border border-dark dark:border-light text-light dark:text-dark font-bold transition-all duration-300 ease-in-out`}
              >
                1.2k
              </span>
              <span
                className={`px-2 py-1 border rounded-r-full ${
                  activeTab === "Listeners"
                    ? "text-light border-primary bg-primary"
                    : "group-hover:bg-primary/65 text-dark dark:text-light border-dark dark:border-light"
                } transition-all duration-300 ease-in-out`}
              >
                Listeners
              </span>
            </button>
          </div>
        </article>
      </section>

      {/* Separator */}
      <section className={`mt-8 h-[1px] bg-dark/50 dark:bg-light/50`}></section>

      {/* Main Content */}
      <div className={`flex-grow relative min-h-0`}>
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={activeTab}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className={`absolute inset-0 w-full`}
          >
            {getFeedContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
