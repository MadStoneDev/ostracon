import Link from "next/link";
import {
  IconHeart,
  IconHeartFilled,
  IconInfoCircleFilled,
  IconNotes,
  IconTool,
  IconUserPlus,
} from "@tabler/icons-react";
import BigButton from "@/components/ui/big-button";
import Post from "@/components/feed/post";

export default function Profile({ params }: { params: { username: string } }) {
  // Variables
  const username = params.username;

  return (
    <main className="flex flex-col min-h-full">
      {/* Header Bar */}
      <nav
        className={`px-[25px] flex justify-between items-stretch gap-10 h-[60px]`}
      >
        <section
          className={`flex items-center font-serif font-black text-sm uppercase`}
        >
          Ostracon
        </section>

        <section className={`flex-grow flex justify-end items-center gap-2`}>
          <Link
            href={`/profile/${username}/settings`}
            className={`hover:text-primary transition-all duration-200`}
          >
            <IconTool size={28} strokeWidth={1.5} />
          </Link>
        </section>
      </nav>

      <section className={`relative mb-[75px] px-[25px] h-[120px] bg-primary`}>
        <article
          className={`absolute top-full -translate-y-1/2  w-[140px] h-[140px] rounded-full bg-dark border-[10px] border-light`}
        ></article>
      </section>

      {/* Main Content */}
      <section className={`px-[25px] grid gap-6`}>
        <article className={`flex flex-col gap-3`}>
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
      <section className={`mx-[25px] my-7 h-[1px] bg-dark`}></section>

      {/* Feed */}
      <section className={`grid`}>
        <Post
          username={username}
          content={`Nullam eu ante non enim tincidunt fringilla. Integer leo. Duis eget enim.

Curabitur felis erat, tempus eu, placerat et, pellentesque sed, purus. Sed sed diam. Nam nunc. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. Aenean risus est, porttitor vel, placerat sit amet, vestibulum sit amet, nibh. Ut faucibus justo quis nisl. Etiam vulputate, sapien eu egestas rutrum, `}
          nsfw={true}
          date={""}
        />
      </section>

      {/* Navigation Bar */}
      <nav
        className={`px-[25px] fixed bottom-0 left-0 right-0 flex items-center h-[60px] bg-secondary`}
      ></nav>
    </main>
  );
}
