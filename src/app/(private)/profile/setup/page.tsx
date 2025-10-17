import ProfileSetupForm from "@/components/profile-setup-form";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Complete Your Ostracon Profile",
  description: "Choose a username to complete your Ostracon account setup.",
};

export default async function ProfileSetup() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("username, date_of_birth")
    .eq("id", user.id)
    .single();

  // If profile exists and has username, redirect to explore
  if (profile?.username) {
    redirect("/explore");
  }

  // If user is under 21, redirect to age restriction page
  if (profile?.date_of_birth) {
    const birthDate = new Date(profile.date_of_birth);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    if (age < 21) {
      redirect("/age-restricted");
    }
  }

  return (
    <main
      className={`flex-grow flex flex-col h-full`}
      style={{ paddingTop: "60px" }}
    >
      <section className={`flex-grow px-[25px] grid grid-cols-1 items-center`}>
        <article>
          <h1 className={`font-serif text-5xl font-black`}>
            Welcome to Ostracon
          </h1>
          <h2 className={`font-serif text-xl`}>Complete your profile</h2>

          <ProfileSetupForm />

          <div className={`mt-2 max-w-sm`}>
            <span style={{ fontSize: "0.8rem", lineHeight: "1rem" }}>
              Your username will be visible to others and can be used to mention
              you in posts.
            </span>
          </div>
        </article>
      </section>

      <footer
        className={`px-[25px] pb-4 flex flex-col justify-center items-start h-fit`}
      >
        <section className={`mt-5`}>
          <p className={`text-xs text-dark/50 dark:text-light/50`}>
            Copyright © 2025 Ostracon. All rights reserved.
          </p>
        </section>
      </footer>
    </main>
  );
}
