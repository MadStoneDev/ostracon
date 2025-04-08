import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { IconX } from "@tabler/icons-react";

export default function UserAvatar({
  username,
  avatar_url,
  avatarSize = `h-10 w-10`,
  letterColour = `text-primary`,
  textSize = `text-2xl`,
  action,
}: {
  username: string;
  avatar_url: string;
  avatarSize?: string;
  letterColour?: string;
  textSize?: string;
  action?: () => void | null;
}) {
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
        <img
          src={avatar_url}
          alt={`Avatar photo of ${username}`}
          className={`h-full w-full object-cover`}
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

      {/* Full Screen Image */}
      {showFullScreen && (
        <article
          className={`fixed top-[60px] left-0 bottom-0 right-0 bg-dark overflow-hidden z-50`}
        >
          {fullscreenImage && (
            <img
              src={fullscreenImage}
              alt={`Avatar photo of ${username}`}
              className={`h-full w-full object-contain`}
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
