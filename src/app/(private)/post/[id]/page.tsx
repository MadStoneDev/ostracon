import { IconChevronLeft } from "@tabler/icons-react";
import { router } from "next/client";

export default function Post() {
  return (
    <main
      className={`flex-grow relative flex flex-col overflow-y-auto`}
      style={{
        marginTop: "60px",
      }}
    >
      {/* Header */}
      <section className={`flex-grow relative px-[25px] flex flex-col`}>
        <article
          className={`pb-4 flex gap-2 border-b border-dark dark:border-light`}
        >
          <button
            className={`opacity-50 hover:opacity-100 hover:text-primary transition-all duration-300 ease-in-out`}
            onClick={() => router.back()}
          >
            <IconChevronLeft size={28} strokeWidth={2} />
          </button>
          <h1 className={`font-serif text-3xl font-black`}>New Post</h1>
        </article>
      </section>

      {/*  Footer*/}
      {/*<footer*/}
      {/*    className={`flex items-center border-y border-dark dark:border-light h-[50px]`}*/}
      {/*    // className={`flex items-center border-y border-dark dark:border-light/20`}*/}
      {/*>*/}
      {/*    <button*/}
      {/*        className={`flex-grow flex justify-center items-center h-full`}*/}
      {/*        onClick={() => setAllowReactions(!allowReactions)}*/}
      {/*    >*/}
      {/*        {allowReactions ? (*/}
      {/*            <IconHeartFilled size={28} strokeWidth={2}/>*/}
      {/*        ) : (*/}
      {/*            <IconHeart size={28} strokeWidth={2}/>*/}
      {/*        )}*/}
      {/*    </button>*/}

      {/*    <button*/}
      {/*        className={`flex-grow flex justify-center items-center h-full`}*/}
      {/*        onClick={() => setAllowComments(!allowComments)}*/}
      {/*    >*/}
      {/*        {allowComments ? (*/}
      {/*            <IconMessageFilled size={28} strokeWidth={2}/>*/}
      {/*        ) : (*/}
      {/*            <IconMessage size={28} strokeWidth={2}/>*/}
      {/*        )}*/}
      {/*    </button>*/}

      {/*    <button*/}
      {/*        className={`flex-grow flex justify-center items-center gap-1 h-full ${*/}
      {/*            postNSFW ? "bg-danger text-light" : "text-dark dark:text-light"*/}
      {/*        }`}*/}
      {/*        onClick={() => setPostNSFW(!postNSFW)}*/}
      {/*    >*/}
      {/*        <IconEyeOff size={28} strokeWidth={2}/>*/}
      {/*    </button>*/}
      {/*</footer>*/}
    </main>
  );
}
