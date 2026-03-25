import React, { useEffect, useState } from "react";
import Image from "next/image";
import { IconX } from "@tabler/icons-react";
import { usePresence } from "@/providers/realtime-provider";

export default function UserAvatar({
  username,
  avatar_url,
  avatarSize = `h-10 w-10`,
  letterColour = `text-primary`,
  textSize = `text-2xl`,
  action,
  userId,
  showPresence = false,
}: {
  username: string;
  avatar_url: string;
  avatarSize?: string;
  letterColour?: string;
  textSize?: string;
  action?: () => void | null;
  userId?: string;
  showPresence?: boolean;
}) {
  const { onlineUsers } = usePresence();
  const isOnline = showPresence && userId ? onlineUsers.has(userId) : false;
  // States
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [fullscreenImage, setFullScreenImage] = useState(``);

  // Effects
  useEffect(() => {
    if (showFullScreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showFullScreen]);

  return (
    <article
      className={`cursor-pointer relative shrink-0 ${avatarSize} rounded-full bg-dark dark:bg-light border-[2px] border-dark dark:border-light overflow-hidden`}
      onClick={() => action?.()}
    >
      {avatar_url ? (
        <Image
          src={avatar_url}
          alt={`Avatar photo of ${username}`}
          fill
          className={`object-cover`}
          unoptimized
          onClick={() => {
            if (!action && setFullScreenImage && setShowFullScreen) {
              setFullScreenImage(avatar_url);
              setShowFullScreen(true);
            }
          }}
        />
      ) : (
        <div
          className={`absolute left-0 top-0 right-0 bottom-0 grid place-content-center`}
        >
          <span className={`${textSize} font-accent ${letterColour}`}>
            {username.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      {/* Online indicator */}
      {isOnline && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full z-10" />
      )}

      {/* Full Screen Image */}
      {showFullScreen && (
        <article
          className={`fixed top-[60px] left-0 bottom-0 right-0 bg-dark overflow-hidden z-50`}
        >
          {fullscreenImage && (
            <Image
              src={fullscreenImage}
              alt={`Avatar photo of ${username}`}
              fill
              className={`object-contain`}
              unoptimized
            />
          )}

          <button
            onClick={() => {
              setShowFullScreen(false);
              setFullScreenImage(``);
            }}
          >
            <IconX
              className={`absolute top-4 right-4 z-10 text-light/50 text-2xl cursor-pointer`}
            />
          </button>
        </article>
      )}
    </article>
  );
}
