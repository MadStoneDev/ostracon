"use client";

import React, { useState } from "react";
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
import { usePathname } from "next/navigation";

export default function BottomNav() {
  // Hooks
  const pathname = usePathname();

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

  return (
    <>
      <nav
        className={`fixed bottom-0 left-0 right-0 px-2 sm:px-[25px] flex items-center justify-between bg-primary text-dark dark:text-light z-50`}
        style={{
          minHeight: "60px",
        }}
      >
        <Link
          href={`/explore`}
          className={`flex items-center justify-center ${
            pathname.includes("/explore") ? "" : ""
          } w-12 h-12 rounded-full transition-all duration-300 ease-in-out`}
        >
          <IconHome size={24} strokeWidth={2} />
        </Link>

        <Link
          href={`/search`}
          className={`flex items-center justify-center ${
            pathname.includes("/groups") ? "" : ""
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
          className={`flex items-center justify-center ${
            pathname.includes("/groups") ? "" : ""
          } rounded-full transition-all duration-300 ease-in-out`}
        >
          <IconSquareRoundedPlusFilled size={56} />
        </Link>

        <Link
          href={`/notifications`}
          className={`flex items-center justify-center ${
            pathname.includes("/notifications") ? "" : ""
          } w-12 h-12 rounded-full transition-all duration-300 ease-in-out`}
        >
          <IconBell size={24} strokeWidth={2} />
        </Link>

        <Link
          href={`/messages`}
          className={`flex items-center justify-center ${
            pathname.includes("/messages") ? "" : ""
          } w-12 h-12 rounded-full transition-all duration-300 ease-in-out`}
        >
          <IconMail size={24} strokeWidth={2} />
        </Link>

        <button
          className={`flex items-center justify-center ${
            pathname.includes("/profile") ? "" : ""
          } w-12 h-12 rounded-full transition-all duration-300 ease-in-out`}
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
        } w-[220px] flex flex-col gap-5 bg-primary z-30 transition-all duration-300 ease-in-out`}
      >
        <Link href={`/profile`} className={`flex items-center gap-5`}>
          <div
            className={`grid place-content-center w-12 h-12 rounded-full border`}
          ></div>
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
          className={`fixed top-0 bottom-0 left-0 right-0 bg-dark/50 dark:bg-dark ${
            showMenu ? "opacity-100" : "pointer-events-none opacity-0"
          } z-20 transition-all duration-300 ease-in-out`}
          onClick={() => closeMenu()}
        ></div>
      )}
    </>
  );
}
