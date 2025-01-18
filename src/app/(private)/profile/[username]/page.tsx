import ProfileContent from "@/components/ui/profile-content";
import { sampleUsers } from "@/data/sample-users";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const username = (await params).username;

  return {
    title: `${username} on Ostracon`,
    description: `The profile page for ${username}`,
  };
}

export default async function Profile({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  // Variables
  const username = (await params).username;
  const userId = sampleUsers.find((user) => user.username === username)?.id;

  return (
    username && userId && <ProfileContent username={username} userId={userId} />
  );
}
