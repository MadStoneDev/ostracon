"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { formatCount } from "@/utils/format-count";
import { createClient } from "@/utils/supabase/client";

import UserAvatar from "@/components/ui/user-avatar";
import LikedFeed from "@/components/profile/liked-feed";
import PostedFeed from "@/components/profile/posted-feed";
import UserPhotosCarousel from "@/components/profile/user-photos-carousel";
import { ListeningFeed, ListenersFeed } from "@/components/profile/listen-feed";
import ModerationLink from "@/components/moderation-link";
import ReportButton from "@/components/report-button";

import { IconUserPlus, IconUserOff } from "@tabler/icons-react";

import { User } from "@supabase/supabase-js";
import { Database } from "../../../database.types";

// Types
type Profile = Database["public"]["Tables"]["users"]["Row"];
type Fragment = Database["public"]["Tables"]["fragments"]["Row"];

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
  currentUser,
  profile,
  postedFeed,
  likedFeed,
  followStats,
  followers,
  following,
  settings,
  userProfiles,
}: {
  currentUser: User;
  profile: Profile;
  postedFeed: Fragment[] | null;
  likedFeed: Fragment[] | null;
  followStats: {
    followersCount: number;
    followingCount: number;
  };
  followers: Profile[] | null;
  following: Profile[] | null;
  settings: any;
  userProfiles: Record<string, Profile>;
}) {
  // States
  const [[activeTab, direction], setActiveTab] = useState(["Posts", 0]);
  const [followingCount, setFollowingCount] = useState(
    followStats.followingCount,
  );
  const [followersCount, setFollowersCount] = useState(
    followStats.followersCount,
  );

  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // Variables
  const isOwnProfile = currentUser.id === profile.id;

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
            currentUser={currentUser}
            user={profile}
            likedFeed={likedFeed}
            settings={settings}
            userProfiles={userProfiles}
          />
        );
      case "Listening":
        return <ListeningFeed user={profile} following={following} />;
      case "Listeners":
        return <ListenersFeed user={profile} followers={followers} />;
      case "Posts":
      default:
        return (
          <PostedFeed
            currentUser={currentUser}
            user={profile}
            postedFeed={postedFeed}
            settings={settings}
            userProfiles={userProfiles}
          />
        );
    }
  };

  const handleListen = async () => {
    if (isFollowLoading) return;

    setIsFollowLoading(true);

    try {
      const supabase = createClient();

      if (isFollowing) {
        // Unfollow: Delete the record
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUser.id)
          .eq("following_id", profile.id);

        if (error) throw error;

        // Update local state
        setIsFollowing(false);
        setFollowersCount((prev) => Math.max(0, prev - 1));
      } else {
        // Follow: Insert a new record
        const { error } = await supabase.from("follows").insert([
          {
            follower_id: currentUser.id,
            following_id: profile.id,
          },
        ]);

        if (error) throw error;

        // Update local state
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
      alert("Failed to update listening status. Please try again.");
    } finally {
      setIsFollowLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (isOwnProfile) return;

      const supabase = createClient();

      // Check if current user is following the profile user
      const { data, error } = await supabase
        .from("follows")
        .select("*")
        .eq("follower_id", currentUser.id)
        .eq("following_id", profile.id)
        .single();

      if (!error && data) {
        setIsFollowing(true);
      } else {
        setIsFollowing(false);
      }
    };

    checkFollowStatus();
  }, [currentUser.id, profile.id, isOwnProfile]);

  return (
    <div className={`relative mx-auto w-full`}>
      {/* Top right actions */}
      <div
        className={`absolute right-4 md:right-6 top-0 flex items-center gap-2`}
      >
        {/* Moderation Link - Show for moderators/admins */}
        <ModerationLink user={currentUser} />
        {/* Follow/Report buttons - Only show if not own profile */}
        {isOwnProfile && (
          <>
            {/* Report Button */}
            <ReportButton
              type="profile"
              targetId={profile.id}
              currentUser={currentUser}
              className={`rounded-full bg-gray-100 dark:bg-neutral-800/80`}
            />
            {/* Follow Button */}
            <button
              onClick={handleListen}
              disabled={isFollowLoading}
              className={`px-2 py-1 flex items-center gap-1 ${
                isFollowing
                  ? "bg-dark dark:bg-light text-light dark:text-dark"
                  : "bg-primary text-light"
              } md:hover:scale-105 rounded-full transition-all duration-300 ease-in-out`}
            >
              {isFollowing ? (
                <>
                  <IconUserOff size={20} />
                  <span>Stop Listening</span>
                </>
              ) : (
                <>
                  <IconUserPlus size={20} />
                  <span>Start Listening</span>
                </>
              )}
            </button>
          </>
        )}
      </div>

      {/* Header */}
      <section>
        {/* Avatar */}
        <UserAvatar
          username={profile.username}
          avatar_url={profile.avatar_url || ""}
          avatarSize={`w-24 md:w-32 h-24 md:h-32`}
          textSize={`text-3xl md:text-6xl`}
        />
        {/* User Info */}
        <article className={`mt-2 mb-8 grid gap-3`}>
          <h1
            className={`font-sans text-2xl md:text-3xl text-primary font-black`}
          >
            {profile.username}
            {isOwnProfile && (
              <span className="ml-2 text-sm opacity-60">(You)</span>
            )}
          </h1>
          <p className={`opacity-75 font-normal`}>{profile.bio}</p>
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
      <UserPhotosCarousel currentUserId={currentUser.id} userId={profile.id} />

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
