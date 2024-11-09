import { redirect } from "next/navigation";

export default function ProfileRedirect() {
  const username = "username";

  redirect(`/profile/${username}`);
}
