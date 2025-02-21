import Link from "next/link";
import LoginForm from "@/components/auth/login-form";

export const metadata = {
  title: "Login at Ostracon",
  description: "Login to your account on Ostracon.",
};

export default function Login() {
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
          <h1 className={`font-serif text-5xl font-black`}>Hi again!</h1>
          <h2 className={`font-serif text-xl`}>Let's get you logged in.</h2>

          <LoginForm />
        </article>
      </section>

      {/* Footer */}
      <footer
        className={`px-[25px] pb-4 flex flex-col justify-center items-start h-fit`}
      >
        <p>
          Don't have an account?{" "}
          <Link href={`/register`} className={`text-primary font-bold`}>
            Create one here.
          </Link>
        </p>

        <section className={`mt-5`}>
          <p className={`text-xs text-dark/50 dark:text-light/50`}>
            Copyright © 2025 Ostracon. All rights reserved.
          </p>
        </section>
      </footer>
    </main>
  );
}
