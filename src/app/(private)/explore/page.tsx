import Post from "@/components/feed/single-post";
import samplePosts from "@/data/sample-posts";
import { sampleUsers } from "@/data/sample-users";

export default function Explore() {
  const listPosts = [...samplePosts].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
    const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className={`grid z-0`}>
      {listPosts.map((post) => {
        const username = sampleUsers.find((user) => user.id === post.user_id)
          ?.username;

        return (
          <article
            key={`feed-post-${post.id}`}
            className={`mb-5 pb-3 border-b last-of-type:border-b-0 border-dark/10 dark:border-light/10 transition-all duration-300 ease-in-out`}
          >
            <Post
              postId={`${post.id}`}
              username={username || "Ghost User"}
              content={post.content}
              nsfw={post.is_nsfw}
              timestamp={post.created_at}
            />
          </article>
        );
      })}
    </div>
  );
}
