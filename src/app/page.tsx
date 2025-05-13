import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { IconUserPlus } from "@tabler/icons-react";

import BigButton from "@/components/ui/big-button";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "Ostracon | Where every voice finds its space",
  description:
    "A safe haven for self-expression, where your voice matters and your wellbeing comes first. Share your story with those who understand.",
};

export default async function Home() {
  // Authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/explore");
  }

  return (
    <main
      className={`flex-grow flex flex-col h-full bg-light dark:bg-dark shadow-xl shadow-neutral-900/30`}
      style={{
        paddingTop: "60px",
      }}
    >
      {/* Main Content */}
      <section className={`flex-grow px-[25px] grid grid-cols-1 items-center`}>
        <article>
          <img
            alt={`Ostracon Symbol`}
            src={`/ostracon-symbol.svg`}
            className={`mb-4 h-20`}
          />
          <h1 className={`font-serif text-5xl font-black`}>Welcome!</h1>
          <h2 className={`font-serif text-xl`}>Let's create a new account</h2>

          <div className={`mt-10`}>
            <BigButton
              title={"Start Posting"}
              indicator={<IconUserPlus size={28} strokeWidth={1.5} />}
              href={`/register`}
              active={true}
            />
          </div>
        </article>
      </section>

      {/* Footer */}
      <footer
        className={`px-[25px] pb-4 flex flex-col justify-center items-start h-fit`}
      >
        <p>
          Already have an account?{" "}
          <Link href={`/login`} className={`text-primary font-bold`}>
            Log in here.
          </Link>
        </p>
        <section className={`mt-5`}>
          <p className={`text-xs text-dark/50 dark:text-light/50`}>
            Copyright © 2025 Ostracon. All rights reserved.
          </p>
        </section>

        <section className={`flex gap-2 text-xs`}>
          <Link href={`/privacy-policy`} className={`text-primary font-bold`}>
            Privacy Policy
          </Link>
          <Link href={`/terms-of-service`} className={`text-primary font-bold`}>
            Terms of Service
          </Link>
        </section>
      </footer>
    </main>
  );
}
