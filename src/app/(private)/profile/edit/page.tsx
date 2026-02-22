import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ProfileEditForm from "@/components/profile/profile-edit-form";

export default async function EditProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, bio, avatar_url, cover_url")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/profile/setup");
  }

  return (
    <div className="grid z-0 pb-[70px]">
      <section className="pb-4 border-b border-dark/20 dark:border-light/20">
        <h1 className="text-2xl font-bold">Edit Profile</h1>
      </section>

      <section className="pt-4">
        <ProfileEditForm profile={profile} />
      </section>
    </div>
  );
}
