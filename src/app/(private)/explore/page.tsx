import Post from "@/components/feed/single-post";

export default function Explore() {
  return (
    <div className={`grid z-0`}>
      {Array(10)
        .fill(0)
        .map((_, i) => (
          <>
            <Post
              key={`feed-post-${i}`}
              username={"username"}
              content={"content"}
              nsfw={false}
              date={"25 May 2023"}
            />

            <div
              className={`my-4 h-[1px] w-full bg-dark dark:bg-light opacity-10`}
            ></div>
          </>
        ))}
    </div>
  );
}
