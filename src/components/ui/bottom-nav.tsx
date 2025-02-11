"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

import {
  IconBell,
  IconCategory,
  IconHome,
  IconInfoCircle,
  IconLayoutList,
  IconMail,
  IconMenu,
  IconPlug,
  IconSearch,
  IconSquarePlus,
  IconSquareRounded,
  IconSquareRoundedPlus,
  IconSquareRoundedPlusFilled,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import UserAvatar from "@/components/ui/user-avatar";

export default function BottomNav() {
  // Hooks
  const pathname = usePathname();
  const router = useRouter();

  // States
  const [showMenu, setShowMenu] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayActive, setOverlayActive] = useState(false);

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
        className={`my-2 mx-2 sm:mx-4 fixed bottom-0 left-0 md:left-1/2 md:-translate-x-1/2 right-0 md:right-auto px-2 flex items-center justify-between bg-dark dark:bg-light text-light dark:text-dark rounded-full z-40 transition-all duration-300 ease-in-out`}
        style={{
          minHeight: "60px",
        }}
      >
        <Link
          href={`/explore`}
          className={`flex items-center justify-center ${
            pathname.includes("/explore") ? "text-primary" : ""
          } w-12 h-12 rounded-full transition-all duration-300 ease-in-out`}
        >
          <IconHome size={24} strokeWidth={2} />
        </Link>

        <Link
          href={`/search`}
          className={`flex items-center justify-center ${
            pathname.includes("/search") ? "" : ""
          } w-12 h-12 rounded-full transition-all duration-300 ease-in-out`}
        >
          <IconSearch size={24} strokeWidth={2} />
        </Link>

        <Link
          href={`/connect`}
          className={`flex items-center justify-center ${
            pathname.includes("/groups") ? "bg-secondary/50" : ""
          } w-12 h-12 rounded-full transition-all duration-300 ease-in-out`}
        >
          <IconPlug size={24} strokeWidth={2} />
        </Link>

        {/* Main Button */}
        <Link
          href={`/post/new`}
          className={`flex items-center justify-center rounded-full transition-all duration-300 ease-in-out`}
        >
          <IconSquareRoundedPlusFilled size={56} />
        </Link>

        <Link
          href={`/notifications`}
          className={`flex items-center justify-center ${
            pathname.includes("/notifications") ? "text-primary" : ""
          } w-12 h-12 rounded-full transition-all duration-300 ease-in-out`}
        >
          <IconBell size={24} strokeWidth={2} />
        </Link>

        <Link
          href={`/messages`}
          className={`flex items-center justify-center ${
            pathname.includes("/messages") ? "text-primary" : ""
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
        className={`fixed px-[25px] py-[100px] top-0 bottom-0 ${
          showMenu ? "right-0" : "-right-full"
        } w-[250px] flex flex-col gap-5 bg-primary z-30 transition-all duration-300 ease-in-out`}
      >
        <Link
          href={`/profile`}
          onClick={() => setShowMenu(false)}
          className={`flex items-center gap-5`}
        >
          <UserAvatar avatar_url={``} username={`test_username`} />
          <span>Profile</span>
        </Link>

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
