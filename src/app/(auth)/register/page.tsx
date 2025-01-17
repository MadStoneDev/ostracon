import Link from "next/link";

import { IconArrowRight } from "@tabler/icons-react";

import BigButton from "@/components/ui/big-button";
import RegisterForm from "@/components/auth/register-form";

export default function Register() {
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
          <h2 className={`font-serif text-xl`}>
            Let's set up your new account
          </h2>

          <RegisterForm />

          <div className={`mt-2 max-w-sm`}>
            <span
              style={{
                fontSize: "0.8rem",
                lineHeight: "1rem",
              }}
            >
              By signing up, you confirm that you are 16 years of age or older
              and agree to Ostracon's{" "}
              <a href={`/terms-of-service`} className="text-primary font-bold">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href={`privacy-policy`} className="text-primary font-bold">
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
      </footer>
    </main>
  );
}
