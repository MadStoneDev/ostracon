import Link from "next/link";
import AuthForm from "@/components/auth/auth-form";

export const metadata = {
  title: "Portal for Ostracon",
  description: "Create a free account on Ostracon to start posting.",
};

export default function AuthPage() {
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
          <h1 className={`font-serif text-5xl font-black`}>Start Creating</h1>
          <h2 className={`font-serif text-xl`}>Enter your email to continue</h2>

          <AuthForm />

          <div className={`mt-2 max-w-sm`}>
            <span
              style={{
                fontSize: "0.8rem",
                lineHeight: "1rem",
              }}
            >
              By continuing, you confirm that you are 16 years of age or older
              and agree to Ostracon's{" "}
              <a href={`/terms-of-service`} className="text-primary font-bold">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href={`/privacy-policy`} className="text-primary font-bold">
                Privacy Policy
              </a>
              .
            </span>
          </div>
        </article>
      </section>

      {/* Footer */}
      <footer
        className={`px-[25px] pb-4 flex flex-col justify-center items-start h-fit`}
      >
        <p>
          Issues logging in?{" "}
          <Link href={`/help`} className={`text-primary font-bold`}>
            Get help here.
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
