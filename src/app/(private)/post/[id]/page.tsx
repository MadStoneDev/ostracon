import PostPage from "@/components/feed/post-page";

export default async function Post({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  console.log(params);

  return <PostPage />;
}
