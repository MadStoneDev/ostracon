import Link from "next/link";
import {
  IconHeart,
  IconHeartFilled,
  IconInfoCircleFilled,
  IconNotes,
  IconTool,
  IconUserPlus,
} from "@tabler/icons-react";

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
      <section className={`px-[25px] flex items-center`}>
        <article className={`mb-10 grid gap-6`}>
          <h1 className={`font-serif text-2xl font-black`}>{username}</h1>
          <p className={`opacity-75 font-normal`}>
            A small bio about this user that tells a little of who they are,
            what they like, how old they are and why they're here.
          </p>

          <div className={`flex items-center gap-5`}>
            <button
              className={`flex items-center h-12 rounded-full bg-primary font-serif text-xl`}
            >
              <div
                className={`grid place-content-center w-12 h-12 rounded-full bg-secondary scale-105`}
              >
                25
              </div>
              <span className={`px-5`}>Followers</span>
            </button>

            <button
              className={`flex items-center h-12 rounded-full bg-primary font-serif text-xl`}
            >
              <div
                className={`grid place-content-center w-12 h-12 rounded-full bg-secondary scale-105`}
              >
                25
              </div>
              <span className={`px-5`}>Followers</span>
            </button>
          </div>

          <div className={`flex items-center gap-5`}>
            <button
              className={`flex items-center h-12 rounded-full bg-primary font-serif text-xl`}
            >
              <span className={`px-5`}>Posted</span>
              <div
                className={`grid place-content-center w-12 h-12 rounded-full bg-secondary scale-105`}
              >
                <IconNotes size={28} strokeWidth={1.5} />
              </div>
            </button>

            <button
              className={`flex items-center h-12 rounded-full bg-primary font-serif text-xl`}
            >
              <span className={`px-5`}>Liked</span>
              <div
                className={`grid place-content-center w-12 h-12 rounded-full bg-secondary scale-105`}
              >
                <IconHeartFilled size={28} strokeWidth={1.5} />
              </div>
            </button>
          </div>
        </article>
      </section>

      {/* Navigation Bar */}
      <nav
        className={`px-[25px] flex items-center h-[60px] bg-secondary`}
      ></nav>
    </main>
  );
}
