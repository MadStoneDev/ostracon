﻿"use client";

import React, { useEffect, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

import { Database } from "../../../database.types";
import { createClient } from "@/utils/supabase/client";

import Post from "@/components/feed/single-post";
import SingleUser from "@/components/feed/single-user";
import { formatCount } from "@/utils/format-count";

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

// Types
type PostFragment = Database["public"]["Tables"]["fragments"]["Row"];
type User = Database["public"]["Tables"]["users"]["Row"];

const PostedFeed = ({
  userId,
  username,
}: {
  userId: string;
  username: string;
}) => {
  const [posts, setPosts] = useState<PostFragment[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Get all fragments for this user
      const { data: fragments } = await supabase
        .from("fragments")
        .select()
        .eq("user_id", userId);

      if (fragments) {
        setPosts(fragments);

        // Get unique user IDs from fragments
        const userIds = [
          ...new Set(fragments.map((fragment) => fragment.user_id)),
        ];

        // Fetch user data for all unique users
        const { data: userData } = await supabase
          .from("users")
          .select()
          .in("id", userIds);

        if (userData) {
          // Create a map of user_id to user data for efficient lookups
          const userMap = userData.reduce(
            (acc, user) => {
              acc[user.id] = user;
              return acc;
            },
            {} as Record<string, User>,
          );

          setUsers(userMap);
        }
      }
    };

    fetchData();
  }, [userId]);

  if (posts.length > 0) {
    return (
      <section className={`pb-[70px] transition-all duration-300 ease-in-out`}>
        {posts.map((post) => {
          const postUser = post.user_id ? users[post.user_id] : undefined;

          return (
            <article
              key={`feed-post-${post.id}`}
              className={`border-b last-of-type:border-b-0 border-dark/10 dark:border-light/10 transition-all duration-300 ease-in-out`}
            >
              <Post
                postId={post.id}
                avatar_url={postUser?.avatar_url || ""}
                username={postUser?.username || "Ghost User"}
                content={post.content || ""}
                nsfw={post.is_nsfw || false}
                timestamp={post.created_at}
              />
            </article>
          );
        })}
      </section>
    );
  }

  return (
    <section
      className={`my-3 pb-[70px] opacity-50 transition-all duration-300 ease-in-out`}
    >
      {username} hasn't posted anything yet.
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
  const [users, setUsers] = useState<Record<string, User>>({});

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Get posts that the user has reacted to
      const { data: reactions } = await supabase
        .from("reactions")
        .select("post_id")
        .eq("user_id", userId);

      if (reactions && reactions.length > 0) {
        const postIds = reactions.map((reaction) => reaction.post_id);

        // Get the actual fragments/posts
        const { data: fragments } = await supabase
          .from("fragments")
          .select()
          .in("id", postIds);

        if (fragments) {
          setPosts(fragments);

          // Get unique user IDs from fragments
          const userIds = [
            ...new Set(fragments.map((fragment) => fragment.user_id)),
          ];

          // Fetch user data for post authors
          const { data: userData } = await supabase
            .from("users")
            .select()
            .in("id", userIds);

          if (userData) {
            const userMap = userData.reduce(
              (acc, user) => {
                acc[user.id] = user;
                return acc;
              },
              {} as Record<string, User>,
            );

            setUsers(userMap);
          }
        }
      }
    };

    fetchData();
  }, [userId]);

  if (posts.length > 0) {
    return (
      <section className={`pb-[70px] transition-all duration-300 ease-in-out`}>
        {posts.map((post) => {
          const postUser = post.user_id ? users[post.user_id] : undefined;

          return (
            <article
              key={`feed-post-${post.id}`}
              className={`border-b last-of-type:border-b-0 border-dark/10 dark:border-light/10 transition-all duration-300 ease-in-out`}
            >
              <Post
                postId={post.id}
                avatar_url={postUser?.avatar_url || ""}
                username={postUser?.username || "Ghost User"}
                content={post.content || ""}
                nsfw={post.is_nsfw || false}
                timestamp={post.created_at}
              />
            </article>
          );
        })}
      </section>
    );
  }

  return (
    <section
      className={`my-3 pb-[70px] opacity-50 transition-all duration-300 ease-in-out`}
    >
      {username} hasn't reacted to any posts yet.
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
  const [followedUsers, setFollowedUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchFollowing = async () => {
      const supabase = createClient();

      // First get all following_ids
      const { data: follows } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", userId);

      if (follows && follows.length > 0) {
        // Then get all users that match these IDs
        const followingIds = follows.map((follow) => follow.following_id);
        const { data: users } = await supabase
          .from("users")
          .select("*")
          .in("id", followingIds);

        if (users) {
          setFollowedUsers(users);
        }
      }
    };

    fetchFollowing();
  }, [userId]);

  if (followedUsers.length === 0) {
    return (
      <section
        className={`my-3 pb-[70px] opacity-50 transition-all duration-300 ease-in-out`}
      >
        {username} isn't listening to anyone yet.
      </section>
    );
  }

  return (
    <section className={`pb-[80px] transition-all duration-300 ease-in-out`}>
      {followedUsers.map((user) => (
        <div
          key={`listening-${user.id}`}
          className={`py-3 border-b border-dark/10 dark:border-light/10`}
        >
          <SingleUser userId={user.id} />
        </div>
      ))}
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
  const [followers, setFollowers] = useState<User[]>([]);

  useEffect(() => {
    const fetchFollowers = async () => {
      const supabase = createClient();

      // First get all follower_ids
      const { data: follows } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("following_id", userId);

      if (follows && follows.length > 0) {
        // Then get all users that match these IDs
        const followerIds = follows.map((follow) => follow.follower_id);
        const { data: users } = await supabase
          .from("users")
          .select("*")
          .in("id", followerIds);

        if (users) {
          setFollowers(users);
        }
      }
    };

    fetchFollowers();
  }, [userId]);

  if (followers.length === 0) {
    return (
      <section
        className={`my-3 pb-[70px] opacity-50 transition-all duration-300 ease-in-out`}
      >
        {username} doesn't have any listeners yet.
      </section>
    );
  }

  return (
    <section className={`pb-[80px] transition-all duration-300 ease-in-out`}>
      {followers.map((user) => (
        <div
          key={`listener-${user.id}`}
          className={`py-3 border-b border-dark/10 dark:border-light/10`}
        >
          <SingleUser userId={user.id} />
        </div>
      ))}
    </section>
  );
};

export default function ProfileContent({
  user,
  userId,
}: {
  user?: any;
  userId: string;
}) {
  // States
  const [[activeTab, direction], setActiveTab] = useState(["Posts", 0]);
  const [prevTab, setPrevTab] = useState("Posted");
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      const supabase = createClient();

      // Get following count
      const { count: following } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", userId);

      // Get followers count
      const { count: followers } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userId);

      setFollowingCount(following || 0);
      setFollowersCount(followers || 0);
    };

    fetchCounts();
  }, [userId]);

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
        return <LikedFeed userId={userId} username={user.username} />;
      case "Listening":
        return <ListeningFeed userId={userId} username={user.username} />;
      case "Listeners":
        return <ListenersFeed userId={userId} username={user.username} />;
      case "Posts":
      default:
        return <PostedFeed userId={userId} username={user.username} />;
    }
  };

  const avatar_url = user.avatar_url;
  const bio = user.bio;

  return (
    <div className={`grid`}>
      {/* Header */}
      <section>
        {/* Avatar */}
        <article
          className={`relative w-32 h-32 rounded-full bg-dark dark:bg-light overflow-hidden`}
        >
          {avatar_url ? (
            <img src={avatar_url} alt={`Avatar photo of ${user.username}`} />
          ) : (
            <div
              className={`absolute left-0 top-0 right-0 bottom-0 grid place-content-center`}
            >
              <span className={`text-6xl font-accent text-primary`}>
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </article>

        {/* User Info */}
        <article className={`mt-2 mb-8 grid gap-3`}>
          <h1 className={`font-sans text-3xl text-primary font-black`}>
            {user.username}
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
                {formatCount(followingCount)}
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
                {formatCount(followersCount)}
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
