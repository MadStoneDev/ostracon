import Link from "next/link";

import Post from "@/components/feed/post";
import BigButton from "@/components/ui/big-button";

import { IconHeartFilled, IconNotes, IconTool } from "@tabler/icons-react";

export default function Profile({ params }: { params: { username: string } }) {
  // Variables
  const username = params.username;

  return (
    <div className={`flex flex-col border border-red-600`}>
      {/* Header */}
      <section className={`relative mb-[75px] px-[25px] h-28 bg-primary`}>
        <article
          className={`absolute top-full -translate-y-1/2  w-36 h-36 rounded-full bg-dark border-[10px] border-light`}
        ></article>
      </section>

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
            <BigButton title={"Followers"} indicator={25} direction={"left"} />

            <BigButton
              title={"Following"}
              indicator={"952k"}
              direction={"left"}
            />
          </div>

          <div className={`flex items-center gap-3`}>
            <BigButton
              title={"Posted"}
              indicator={<IconNotes size={28} strokeWidth={1.5} />}
            />

            <BigButton
              title={"Followers"}
              indicator={<IconHeartFilled size={28} strokeWidth={1.5} />}
            />
          </div>
        </article>
      </section>
      {/* Separator */}
      <section
        className={`mx-[25px] my-7 h-[1px] bg-dark dark:bg-light`}
      ></section>
      {/* Feed */}
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
    </div>
  );
}
