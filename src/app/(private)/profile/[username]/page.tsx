import ProfileContent from "@/components/ui/profile-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const username = (await params).username;

  return {
    title: `${username} on Ostracon`,
    description: `A profile for ${username}`,
  };
}

export default async function Profile({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  // Variables
  const username = (await params).username;

  return <ProfileContent username={username} />;
}
