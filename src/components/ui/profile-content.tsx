"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { formatCount } from "@/utils/format-count";

// Import separated components
import PostedFeed from "@/components/profile/posted-feed";
import LikedFeed from "@/components/profile/liked-feed";
import { ListeningFeed, ListenersFeed } from "@/components/profile/listen-feed";
import UserPhotosCarousel from "@/components/profile/user-photos-carousel";

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

export default function ProfileContent({
  user,
  userId,
  currentUserId,
}: {
  user?: any;
  userId: string;
  currentUserId: string;
}) {
  // States
  const [[activeTab, direction], setActiveTab] = useState(["Posts", 0]);
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

    setActiveTab([newTab, newDirection]);
  };

  const getFeedContent = () => {
    switch (activeTab) {
      case "Likes":
        return (
          <LikedFeed
            userId={userId}
            username={user.username}
            currentUserId={currentUserId}
          />
        );
      case "Listening":
        return <ListeningFeed userId={userId} username={user.username} />;
      case "Listeners":
        return <ListenersFeed userId={userId} username={user.username} />;
      case "Posts":
      default:
        return (
          <PostedFeed
            userId={userId}
            username={user.username}
            currentUserId={currentUserId}
          />
        );
    }
  };

  const avatar_url = user.avatar_url;
  const bio = user.bio;

  // Check if user is viewing their own profile
  const isOwnProfile = userId === currentUserId;

  return (
    <div className={`grid`}>
      {/* Header */}
      <section>
        {/* Avatar */}
        <article
          className={`relative w-32 h-32 rounded-full bg-dark dark:bg-light overflow-hidden`}
        >
          {avatar_url ? (
            <img
              src={avatar_url}
              alt={`Avatar photo of ${user.username}`}
              className="w-full h-full object-cover"
            />
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
            {isOwnProfile && (
              <span className="ml-2 text-sm opacity-60">(You)</span>
            )}
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

      {/* First Separator */}
      <section className={`mt-8 h-[1px] bg-dark/50 dark:bg-light/50`}></section>

      {/* Photo Carousel */}
      <UserPhotosCarousel userId={userId} currentUserId={currentUserId} />

      {/* Second Separator */}
      <section className={`h-[1px] bg-dark/50 dark:bg-light/50`}></section>

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
