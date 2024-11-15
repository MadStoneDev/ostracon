"use client";

import { useState } from "react";

import Post from "@/components/feed/post";
import BigButton from "@/components/ui/big-button";
import { motion, AnimatePresence } from "framer-motion";

import { IconHeartFilled, IconNotes } from "@tabler/icons-react";

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

const PostedFeed = ({ username }: { username: string }) => {
  return (
    <section className={`grid`}>
      <Post
        username={username}
        content={`Nullam eu ante non enim tincidunt fringilla. Integer leo. Duis eget enim.
          
          Curabitur felis erat, tempus eu, placerat et, pellentesque sed, purus. Sed sed diam. Nam nunc. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. Aenean risus est, porttitor vel, placerat sit amet, vestibulum sit amet, nibh. Ut faucibus justo quis nisl. Etiam vulputate, sapien eu egestas rutrum, `}
        nsfw={true}
        date={""}
      />

      <Post
        username={username}
        content={`Nullam eu ante non enim tincidunt fringilla. Integer leo. Duis eget enim.
          
          Curabitur felis erat, tempus eu, placerat et, pellentesque sed, purus. Sed sed diam. Nam nunc. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. Aenean risus est, porttitor vel, placerat sit amet, vestibulum sit amet, nibh. Ut faucibus justo quis nisl. Etiam vulputate, sapien eu egestas rutrum, Curabitur felis erat, tempus eu, placerat et, pellentesque sed, purus. Sed sed diam. Nam nunc. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. Aenean risus est, porttitor vel, placerat sit amet, vestibulum sit amet, nibh. Ut faucibus justo quis nisl. Etiam vulputate, sapien eu egestas rutrum,`}
        nsfw={false}
        date={""}
      />

      <Post
        username={username}
        content={`Nullam eu ante non enim tincidunt fringilla. Integer leo. Duis eget enim.
          
          Curabitur felis erat, tempus eu, placerat et, pellentesque sed, purus. Sed sed diam. Nam nunc. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. Aenean risus est, porttitor vel, placerat sit amet, vestibulum sit amet, nibh. Ut faucibus justo quis nisl. Etiam vulputate, sapien eu egestas rutrum, Curabitur felis erat, tempus eu, placerat et, pellentesque sed, purus. Sed sed diam. Nam nunc. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. Aenean risus est, porttitor vel, placerat sit amet, vestibulum sit amet, nibh. Ut faucibus justo quis nisl. Etiam vulputate, sapien eu egestas rutrum,`}
        nsfw={false}
        date={""}
      />
    </section>
  );
};

const LikedFeed = ({ username }: { username: string }) => {
  return (
    <section className={`grid`}>
      <Post
        username={username}
        content={`Nullam eu ante non enim tincidunt fringilla. Integer leo. Duis eget enim.
          
          Curabitur felis erat, tempus eu, placerat et, pellentesque sed, purus. Sed sed diam. Nam nunc. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. Aenean risus est, porttitor vel, placerat sit amet, vestibulum sit amet, nibh. Ut faucibus justo quis nisl. Etiam vulputate, sapien eu egestas rutrum, `}
        nsfw={true}
        date={""}
      />

      <Post
        username={username}
        content={`Nullam eu ante non enim tincidunt fringilla. Integer leo. Duis eget enim.
          
          Curabitur felis erat, tempus eu, placerat et, pellentesque sed, purus. Sed sed diam. Nam nunc. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. Aenean risus est, porttitor vel, placerat sit amet, vestibulum sit amet, nibh. Ut faucibus justo quis nisl. Etiam vulputate, sapien eu egestas rutrum, `}
        nsfw={true}
        date={""}
      />
    </section>
  );
};

const FollowersFeed = ({ username }: { username: string }) => {
  return (
    <section className={`grid`}>
      <Post
        username={username}
        content={`Nullam eu ante non enim tincidunt fringilla. Integer leo. Duis eget enim.
          
          Curabitur felis erat, tempus eu, placerat et, pellentesque sed, purus. Sed sed diam. Nam nunc. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. Aenean risus est, porttitor vel, placerat sit amet, vestibulum sit amet, nibh. Ut faucibus justo quis nisl. Etiam vulputate, sapien eu egestas rutrum, `}
        nsfw={true}
        date={""}
      />

      <Post
        username={username}
        content={`Nullam eu ante non enim tincidunt fringilla. Integer leo. Duis eget enim.
          
          Curabitur felis erat, tempus eu, placerat et, pellentesque sed, purus. Sed sed diam. Nam nunc. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. Aenean risus est, porttitor vel, placerat sit amet, vestibulum sit amet, nibh. Ut faucibus justo quis nisl. Etiam vulputate, sapien eu egestas rutrum, `}
        nsfw={true}
        date={""}
      />
    </section>
  );
};

const FollowingFeed = ({ username }: { username: string }) => {
  return (
    <section className={`grid`}>
      <Post
        username={username}
        content={`Nullam eu ante non enim tincidunt fringilla. Integer leo. Duis eget enim.
          
          Curabitur felis erat, tempus eu, placerat et, pellentesque sed, purus. Sed sed diam. Nam nunc. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. Aenean risus est, porttitor vel, placerat sit amet, vestibulum sit amet, nibh. Ut faucibus justo quis nisl. Etiam vulputate, sapien eu egestas rutrum, `}
        nsfw={true}
        date={""}
      />

      <Post
        username={username}
        content={`Nullam eu ante non enim tincidunt fringilla. Integer leo. Duis eget enim.
          
          Curabitur felis erat, tempus eu, placerat et, pellentesque sed, purus. Sed sed diam. Nam nunc. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. Aenean risus est, porttitor vel, placerat sit amet, vestibulum sit amet, nibh. Ut faucibus justo quis nisl. Etiam vulputate, sapien eu egestas rutrum, `}
        nsfw={true}
        date={""}
      />
    </section>
  );
};

export default function ProfileContent({ username }: { username: string }) {
  // States
  const [[activeTab, direction], setActiveTab] = useState(["Posted", 0]);
  const [prevTab, setPrevTab] = useState("Posted");

  // Functions
  const updateTab = (newTab: string) => {
    const tabOrder = ["Posted", "Liked", "Followers", "Following"];
    const currentIndex = tabOrder.indexOf(activeTab);
    const newIndex = tabOrder.indexOf(newTab);
    const newDirection = newIndex > currentIndex ? 1 : -1;

    setPrevTab(newTab);
    setActiveTab([newTab, newDirection]);
  };

  const getFeedContent = () => {
    switch (activeTab) {
      case "Liked":
        return <LikedFeed username={username} />;
      case "Followers":
        return <FollowersFeed username={username} />;
      case "Following":
        return <FollowingFeed username={username} />;
      case "Posted":
      default:
        return <PostedFeed username={username} />;
    }
  };

  return (
    <div className={`flex-grow flex flex-col min-h-0`}>
      {/*Main Content*/}
      <section className={`px-[25px] grid gap-6`}>
        <article className={`mt-2 flex flex-col gap-3`}>
          <h1 className={`font-serif text-2xl font-black`}>{username}</h1>
          <p className={`opacity-75 font-normal`}>
            A small bio about this user that tells a little of who they are,
            what they like, how old they are and why they're here.
          </p>
        </article>

        <article className={`flex flex-col justify-center gap-2`}>
          <div className={`flex items-center gap-2`}>
            <BigButton
              title={"Followers"}
              indicator={25}
              direction={"left"}
              active={activeTab === "Followers"}
              onClick={() => updateTab("Followers")}
            />

            <BigButton
              title={"Following"}
              indicator={"952k"}
              direction={"left"}
              active={activeTab === "Following"}
              onClick={() => updateTab("Following")}
            />
          </div>

          <div className={`flex items-center gap-2`}>
            <BigButton
              title={"Posted"}
              indicator={<IconNotes size={28} strokeWidth={1.5} />}
              active={activeTab === "Posted"}
              onClick={() => updateTab("Posted")}
            />

            <BigButton
              title={"Liked"}
              indicator={<IconHeartFilled size={28} strokeWidth={1.5} />}
              active={activeTab === "Liked"}
              onClick={() => updateTab("Liked")}
            />
          </div>
        </article>
      </section>

      {/* Separator */}
      <section
        className={`mx-[25px] my-7 h-[1px] bg-dark dark:bg-light`}
      ></section>

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
