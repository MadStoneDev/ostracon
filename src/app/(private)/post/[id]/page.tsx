import PostPage from "@/components/feed/post-page";
import SamplePosts from "@/data/sample-posts";

export default async function Post({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const postId = (await params).id;
  const post = SamplePosts.find((post) => post.id === postId);

  return (
    <main
      className={`flex-grow relative flex flex-col overflow-y-auto`}
      style={{
        marginTop: "60px",
      }}
    >
      <section className={`mt-5 relative flex-grow px-[25px]`}>
        {post ? (
          <PostPage postId={postId} post={post} />
        ) : (
          <span className={`text-sm italic`}>Post not found</span>
        )}
      </section>
    </main>
  );
}
