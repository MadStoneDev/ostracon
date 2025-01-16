import BigButton from "@/components/ui/big-button";
import { IconUserPlus } from "@tabler/icons-react";
import Link from "next/link";
import LoginForm from "@/components/auth/login-form";

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
          <h1 className={`font-serif text-5xl font-black`}>Welcome Back!</h1>
          <h2 className={`font-serif text-xl`}>Let's get you logged in</h2>

          <LoginForm />
        </article>
      </section>

      {/* Footer */}
      <footer className={`px-[25px] flex items-center h-[60px]`}>
        <p>
          Already have an account?{" "}
          <Link href={`/login`} className={`text-primary font-bold`}>
            Log in here.
          </Link>
        </p>
      </footer>
    </main>
  );
}
