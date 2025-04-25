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

  if (user) {
    const { data: profile } = await supabase
      .from(`users`)
      .select()
      .eq(`id`, user.id)
      .single();
    if (profile) {
      redirect("/explore");
    }
  } else {
    redirect("/auth");
  }

  return (
    <main
      className={`flex-grow flex flex-col h-full`}
      style={{
        paddingTop: "60px",
      }}
    >
      {/* Main Content */}
      <section className={`flex-grow px-[25px] grid grid-cols-1 items-center`}>
        <article>
          <h1 className={`font-serif text-5xl font-black`}>
            Welcome to Ostracon
          </h1>
          <h2 className={`font-serif text-xl`}>
            Choose a username to get started
          </h2>

          <ProfileSetupForm />

          <div className={`mt-2 max-w-sm`}>
            <span
              style={{
                fontSize: "0.8rem",
                lineHeight: "1rem",
              }}
            >
              Your username will be visible to others and can be used to mention
              you in posts.
            </span>
          </div>
        </article>
      </section>

      {/* Footer */}
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
