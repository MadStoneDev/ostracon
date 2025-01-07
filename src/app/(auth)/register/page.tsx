import BigButton from "@/components/ui/big-button";
import Link from "next/link";

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
          <h2 className={`font-serif text-xl`}>Let's set up a new account</h2>

          <div className={`mt-10`}>
            <input type={"email"} placeholder={"Email"} />
            <BigButton
              title={"Start creating"}
              indicator={<div></div>}
              href={`/register`}
              active={true}
            />
          </div>
        </article>
      </section>

      {/* Footer */}
      <footer className={`px-[25px] flex items-center h-[60px]`}>
        <p>
          Already have an account?{" "}
          <Link href={`/login`} className={`text-primarydam font-bold`}>
            Log in here.
          </Link>
        </p>
      </footer>
    </main>
  );
}
