"use client";

import { useState } from "react";

import Post from "@/components/feed/post";
import BigButton from "@/components/ui/big-button";

import { IconHeartFilled, IconNotes } from "@tabler/icons-react";

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
          
          Curabitur felis erat, tempus eu, placerat et, pellentesque sed, purus. Sed sed diam. Nam nunc. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. Aenean risus est, porttitor vel, placerat sit amet, vestibulum sit amet, nibh. Ut faucibus justo quis nisl. Etiam vulputate, sapien eu egestas rutrum, `}
        nsfw={true}
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
  const [activeTab, setActiveTab] = useState("Posted");

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
    <div className={`flex flex-col`}>
      {/*Main Content*/}
      <section className={`px-[25px] grid gap-6`}>
        <article className={`mt-2 flex flex-col gap-3`}>
          <h1 className={`font-serif text-2xl font-black`}>{username}</h1>
          <p className={`opacity-75 font-normal`}>
            A small bio about this user that tells a little of who they are,
            what they like, how old they are and why they're here.
          </p>
        </article>

        <article className={`flex flex-col justify-center gap-4`}>
          <div className={`flex items-center gap-3`}>
            <BigButton
              title={"Followers"}
              indicator={25}
              direction={"left"}
              active={activeTab === "Followers"}
              onClick={() => setActiveTab("Followers")}
            />

            <BigButton
              title={"Following"}
              indicator={"952k"}
              direction={"left"}
              active={activeTab === "Following"}
              onClick={() => setActiveTab("Following")}
            />
          </div>

          <div className={`flex items-center gap-3`}>
            <BigButton
              title={"Posted"}
              indicator={<IconNotes size={28} strokeWidth={1.5} />}
              active={activeTab === "Posted"}
              onClick={() => setActiveTab("Posted")}
            />

            <BigButton
              title={"Liked"}
              indicator={<IconHeartFilled size={28} strokeWidth={1.5} />}
              active={activeTab === "Liked"}
              onClick={() => setActiveTab("Liked")}
            />
          </div>
        </article>
      </section>
      {/* Separator */}
      <section
        className={`mx-[25px] my-7 h-[1px] bg-dark dark:bg-light`}
      ></section>

      {getFeedContent()}
    </div>
  );
}
