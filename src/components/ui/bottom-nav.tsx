"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  IconBell,
  IconHome,
  IconInfoCircle,
  IconLogout,
  IconMail,
  IconMenu,
  IconPlug,
  IconSearch,
  IconSend,
  IconSquareRoundedArrowRightFilled,
  IconSquareRoundedPlusFilled,
  IconX,
} from "@tabler/icons-react";
import UserAvatar from "@/components/ui/user-avatar";
import { createClient } from "@/utils/supabase/client";

import { User } from "@supabase/supabase-js";
import { Tables } from "../../../database.types";

type Profile = Tables<`users`>;

export default function BottomNav({
  user = null,
  profile = null,
}: {
  user?: User | null;
  profile?: Profile | null;
}) {
  // Hooks
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // States
  const [showMenu, setShowMenu] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayActive, setOverlayActive] = useState(false);

  const isCommunityPage = pathname.startsWith("/connect");
  const communityName = isCommunityPage ? pathname.split("/")[2] : "";

  const newPostLink = isCommunityPage
    ? `/post/new?community=${communityName}`
    : "/post/new";

  const newMessageLink = "/messages/new";

  // Functions
  const closeMenu = () => {
    setShowMenu(false);
    setShowOverlay(false);

    setTimeout(() => {
      setOverlayActive(false);
      1;
    }, 300);
  };

  const openMenu = () => {
    setOverlayActive(true);

    setTimeout(() => {
      setShowOverlay(true);
      setShowMenu(true);
    }, 10);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  };

  // Effects
  useEffect(() => {
    if (showMenu) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showMenu]);

  return (
    <>
      <nav
        className={`my-2 mx-2 sm:mx-4 fixed bottom-0 left-0 md:left-1/2 md:-translate-x-1/2 right-0 md:right-auto px-2 flex items-center justify-between bg-dark dark:bg-light text-light dark:text-dark rounded-full z-50 transition-all duration-300 ease-in-out`}
        style={{
          minHeight: "60px",
        }}
      >
        <Link
          href={`/explore`}
          className={`flex items-center justify-center ${
            pathname.includes("/explore") ? "bg-primary rounded-full" : ""
          } w-12 h-12 rounded-full transition-all duration-300 ease-in-out`}
        >
          <IconHome size={24} strokeWidth={2} />
        </Link>

        <Link
          href={`/search`}
          className={`flex items-center justify-center ${
            pathname.includes("/search") ? "bg-primary rounded-full" : ""
          } w-12 h-12 rounded-full transition-all duration-300 ease-in-out`}
        >
          <IconSearch size={24} strokeWidth={2} />
        </Link>

        <Link
          href={`/connect`}
          className={`flex items-center justify-center ${
            pathname.includes("/connect") ? "bg-primary rounded-full" : ""
          } w-12 h-12 rounded-full transition-all duration-300 ease-in-out`}
        >
          <IconPlug size={24} strokeWidth={2} />
        </Link>

        {/* Main Button */}
        {pathname === "/messages" ? (
          <Link
            href={newMessageLink}
            className={`flex items-center justify-center rounded-full transition-all duration-300 ease-in-out`}
          >
            <IconSquareRoundedPlusFilled size={56} />
          </Link>
        ) : (
          <Link
            href={newPostLink}
            className={`flex items-center justify-center rounded-full transition-all duration-300 ease-in-out`}
          >
            <IconSquareRoundedPlusFilled size={56} />
          </Link>
        )}

        <Link
          href={`/notifications`}
          className={`flex items-center justify-center ${
            pathname.includes("/notifications") ? "bg-primary rounded-full" : ""
          } w-12 h-12 rounded-full transition-all duration-300 ease-in-out`}
        >
          <IconBell size={24} strokeWidth={2} />
        </Link>

        <Link
          href={`/messages`}
          className={`flex items-center justify-center ${
            pathname.includes("/messages") ? "bg-primary rounded-full" : ""
          } w-12 h-12 rounded-full transition-all duration-300 ease-in-out`}
        >
          <IconMail size={24} strokeWidth={2} />
        </Link>

        <button
          className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ease-in-out`}
          onClick={() => {
            showMenu ? closeMenu() : openMenu();
          }}
        >
          {showMenu ? (
            <IconX size={24} strokeWidth={2} />
          ) : (
            <IconMenu size={24} strokeWidth={2} />
          )}
        </button>
      </nav>

      <section
        className={`fixed top-0 bottom-0 px-[25px] py-[100px] ${
          showMenu ? "right-0" : "-right-full"
        } w-[250px] flex flex-col gap-5 bg-primary z-40 transition-all duration-300 ease-in-out`}
      >
        {profile && (
          <Link
            href={`/profile`}
            onClick={() => setShowMenu(false)}
            className={`flex items-center gap-5`}
          >
            <div className={`h-12 w-12 grid place-content-center`}>
              <UserAvatar
                avatar_url={profile.avatar_url || ""}
                username={profile.username || ""}
                avatarSize={`h-8 w-8`}
                letterColour={`text-light dark:text-dark`}
              />
            </div>
            <span>Profile</span>
          </Link>
        )}

        <Link href={`/search`} className={`flex items-center gap-5`}>
          <div className={`grid place-content-center w-12 h-12`}>
            <IconSearch size={24} strokeWidth={2} />
          </div>
          <span>Search</span>
        </Link>

        <Link href={`/help`} className={`flex items-center gap-5`}>
          <div className={`grid place-content-center w-12 h-12`}>
            <IconInfoCircle size={24} strokeWidth={2} />
          </div>
          <span>Help</span>
        </Link>

        <button className={`flex items-center gap-5`} onClick={handleLogout}>
          <div className={`grid place-content-center w-12 h-12`}>
            <IconLogout size={24} strokeWidth={2} />
          </div>
          <span>Logout</span>
        </button>
      </section>

      {/* Overlay */}
      {overlayActive && (
        <div
          className={`fixed top-0 bottom-0 left-0 right-0 bg-dark/50 dark:bg-light-50 ${
            showMenu ? "opacity-100" : "pointer-events-none opacity-0"
          } z-20 transition-all duration-300 ease-in-out`}
          onClick={() => closeMenu()}
        ></div>
      )}
    </>
  );
}
