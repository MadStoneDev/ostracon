"use client";

import React, { useEffect, useState } from "react";

import Post from "@/components/feed/single-post";
import BigButton from "@/components/ui/big-button";
import { motion, AnimatePresence } from "framer-motion";

import { IconHeartFilled, IconNotes } from "@tabler/icons-react";
import samplePosts from "@/data/sample-posts";
import { PostFragment } from "@/types/fragments";
import { sampleUsers } from "@/data/sample-users";

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
            className={`mb-5 pb-3 border-b last-of-type:border-b-0 border-dark/10 dark:border-light/10 transition-all duration-300 ease-in-out`}
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
  return (
    <section className={`grid`}>
      {/*<Post*/}
      {/*  username={username}*/}
      {/*  content={`Nullam eu ante non enim tincidunt fringilla. Integer leo. Duis eget enim.*/}
      {/*    */}
      {/*    Curabitur felis erat, tempus eu, placerat et, pellentesque sed, purus. Sed sed diam. Nam nunc. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. Aenean risus est, porttitor vel, placerat sit amet, vestibulum sit amet, nibh. Ut faucibus justo quis nisl. Etiam vulputate, sapien eu egestas rutrum, `}*/}
      {/*  nsfw={true}*/}
      {/*  date={""}*/}
      {/*/>*/}

      {/*<Post*/}
      {/*  username={username}*/}
      {/*  content={`Nullam eu ante non enim tincidunt fringilla. Integer leo. Duis eget enim.*/}
      {/*    */}
      {/*    Curabitur felis erat, tempus eu, placerat et, pellentesque sed, purus. Sed sed diam. Nam nunc. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. Aenean risus est, porttitor vel, placerat sit amet, vestibulum sit amet, nibh. Ut faucibus justo quis nisl. Etiam vulputate, sapien eu egestas rutrum, `}*/}
      {/*  nsfw={true}*/}
      {/*  date={""}*/}
      {/*/>*/}
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
    <section className={`grid`}>
      {/*<Post*/}
      {/*  username={username}*/}
      {/*  content={`Nullam eu ante non enim tincidunt fringilla. Integer leo. Duis eget enim.*/}
      {/*    */}
      {/*    Curabitur felis erat, tempus eu, placerat et, pellentesque sed, purus. Sed sed diam. Nam nunc. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. Aenean risus est, porttitor vel, placerat sit amet, vestibulum sit amet, nibh. Ut faucibus justo quis nisl. Etiam vulputate, sapien eu egestas rutrum, `}*/}
      {/*  nsfw={true}*/}
      {/*  date={""}*/}
      {/*/>*/}

      {/*<Post*/}
      {/*  username={username}*/}
      {/*  content={`Nullam eu ante non enim tincidunt fringilla. Integer leo. Duis eget enim.*/}
      {/*    */}
      {/*    Curabitur felis erat, tempus eu, placerat et, pellentesque sed, purus. Sed sed diam. Nam nunc. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. Aenean risus est, porttitor vel, placerat sit amet, vestibulum sit amet, nibh. Ut faucibus justo quis nisl. Etiam vulputate, sapien eu egestas rutrum, `}*/}
      {/*  nsfw={true}*/}
      {/*  date={""}*/}
      {/*/>*/}
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
    <section className={`grid`}>
      {/*<Post*/}
      {/*  username={username}*/}
      {/*  content={`Nullam eu ante non enim tincidunt fringilla. Integer leo. Duis eget enim.*/}
      {/*    */}
      {/*    Curabitur felis erat, tempus eu, placerat et, pellentesque sed, purus. Sed sed diam. Nam nunc. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. Aenean risus est, porttitor vel, placerat sit amet, vestibulum sit amet, nibh. Ut faucibus justo quis nisl. Etiam vulputate, sapien eu egestas rutrum, `}*/}
      {/*  nsfw={true}*/}
      {/*  date={""}*/}
      {/*/>*/}

      {/*<Post*/}
      {/*  username={username}*/}
      {/*  content={`Nullam eu ante non enim tincidunt fringilla. Integer leo. Duis eget enim.*/}
      {/*    */}
      {/*    Curabitur felis erat, tempus eu, placerat et, pellentesque sed, purus. Sed sed diam. Nam nunc. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. Aenean risus est, porttitor vel, placerat sit amet, vestibulum sit amet, nibh. Ut faucibus justo quis nisl. Etiam vulputate, sapien eu egestas rutrum, `}*/}
      {/*  nsfw={true}*/}
      {/*  date={""}*/}
      {/*/>*/}
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

    console.log(newTab);
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

  return (
    <main className={`flex-grow flex flex-col gap-4 min-h-0 overflow-y-auto`}>
      <div className={`px-[25px]`}>
        {/* Header */}
        <section className={`relative`}>
          <article className={`w-32 h-32 rounded-full bg-dark dark:bg-light`}>
            {/*<img src={avatar_url} alt={`Avatar photo of ${username}`} />*/}
          </article>
        </section>

        {/* User Info */}
        <section className={`mt-2 grid gap-10`}>
          <article className={`flex flex-col gap-5`}>
            <h1 className={`font-sans text-3xl text-primary font-black`}>
              {username}
            </h1>
            <p className={`opacity-75 font-normal`}>
              A small bio about this user that tells a little of who they are,
              what they like, how old they are and why they're here.
            </p>
          </article>

          <article className={`flex flex-col justify-center gap-3`}>
            <div className={`flex items-center gap-2`}>
              <button
                className={`px-3 py-1 flex items-center gap-3 rounded-full border ${
                  activeTab === "Posts"
                    ? "text-light border-primary bg-primary"
                    : "hover:bg-primary/65 text-dark dark:text-light border-dark dark:border-light"
                } transition-all duration-300 ease-in-out`}
                onClick={() => updateTab("Posts")}
              >
                <span>Posts</span>
              </button>

              <button
                className={`px-3 py-1 flex items-center gap-3 rounded-full border ${
                  activeTab === "Likes"
                    ? "text-light border-primary bg-primary"
                    : "hover:bg-primary/65 text-dark dark:text-light border-dark dark:border-light"
                } transition-all duration-300 ease-in-out`}
                onClick={() => updateTab("Likes")}
              >
                <span>Likes</span>
              </button>
            </div>

            <div className={`flex items-center gap-8`}>
              <button
                className={`group flex items-center rounded-full hover:text-primary/65 overflow-hidden transition-all duration-300 ease-in-out`}
                onClick={() => updateTab("Listening")}
              >
                <span
                  className={`px-3 py-1 bg-dark dark:bg-light rounded-l-full border border-dark text-light dark:text-dark font-bold transition-all duration-300 ease-in-out`}
                >
                  150
                </span>
                <span
                  className={`px-3 py-1 border rounded-r-full ${
                    activeTab === "Listening"
                      ? "text-light border-primary bg-primary"
                      : "group-hover:bg-primary/65 text-dark dark:text-light border-dark dark:border-light"
                  } transition-all duration-300 ease-in-out`}
                >
                  Listening
                </span>
              </button>

              <button
                className={`group flex items-center rounded-full hover:text-primary/65 overflow-hidden transition-all duration-300 ease-in-out`}
                onClick={() => updateTab("Listeners")}
              >
                <span
                  className={`px-3 py-1 bg-dark dark:bg-light rounded-l-full border border-dark text-light dark:text-dark font-bold transition-all duration-300 ease-in-out`}
                >
                  1.2k
                </span>
                <span
                  className={`px-3 py-1 border rounded-r-full ${
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
      </div>

      {/* Separator */}
      <section className={`my-4 h-[1px] bg-dark/10 dark:bg-light`}></section>

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
            className={`px-[25px] absolute inset-0 w-full`}
          >
            {getFeedContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
