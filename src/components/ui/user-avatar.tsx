import { Dispatch, SetStateAction } from "react";

export default function UserAvatar({
  avatar_url,
  avatarSize = `h-10 w-10`,
  username,
  setFullScreenImage,
  setShowFullScreen,
  action,
}: {
  avatar_url: string;
  avatarSize?: string;
  username: string;
  setFullScreenImage?: Dispatch<SetStateAction<string>>;
  setShowFullScreen?: Dispatch<SetStateAction<boolean>>;
  action?: () => void | null;
}) {
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
          <span className={`text-2xl font-accent text-primary`}>
            {username.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </article>
  );
}
