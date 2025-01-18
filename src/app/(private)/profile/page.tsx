import { redirect } from "next/navigation";
import sampleMe from "@/data/sample-me";
import { sampleUsers } from "@/data/sample-users";

export default function ProfileRedirect() {
  // TODO: Get logged in user from session
  const currentUser = sampleMe;
  const username = sampleUsers.find((user) => user.id === currentUser)
    ?.username;

  if (!username) {
    // TODO: Fix no user found
    return <div>No user found</div>;
  }

  redirect(`/profile/${username}`);
}
