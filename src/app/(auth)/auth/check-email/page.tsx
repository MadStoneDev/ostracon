import AuthForm from "@/components/auth/auth-form";
import Link from "next/link";

export const metadata = {
  title: "Thank you for Registering - Ostracon",
  description: "Thank you for registering at Ostracon.",
};

export default function CheckEmailPage() {
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
          <h1 className={`font-serif text-5xl font-black`}>Thank You!</h1>
          <h2 className={`font-serif text-xl`}>
            You're all signed up. Please check your email.
          </h2>

          <p className={`my-10`}>
            We've sent you a verification link to your email address.
            <br />
            Please check your inbox, and maybe your spam folder.
          </p>

          <div className={`mt-2 max-w-xs`}>
            <span
              style={{
                fontSize: "0.8rem",
                lineHeight: "1rem",
              }}
            >
              If you have any problems, please get in touch with us through our{" "}
              <a href={`/support/contact`} className="text-primary font-bold">
                contact form
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
        <section className={`mt-5`}>
          <p className={`text-xs text-dark/50 dark:text-light/50`}>
            Copyright © 2025 Ostracon. All rights reserved.
          </p>
        </section>
      </footer>
    </main>
  );
}
