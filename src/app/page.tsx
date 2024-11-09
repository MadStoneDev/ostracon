import {
  IconInfoCircleFilled,
  IconSun,
  IconUserPlus,
} from "@tabler/icons-react";
import Link from "next/link";
import BigButton from "@/components/ui/big-button";
import MainNav from "@/components/ui/main-nav";

export const metadata = {
  title: "Ostracon",
  description: "Welcome to Ostracon!",
};

export default function Home() {
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
          <h1 className={`font-serif text-5xl font-black`}>Welcome!</h1>
          <h2 className={`font-serif text-xl`}>Let's create a new account</h2>

          <div className={`mt-10`}>
            <BigButton
              title={"Start creating"}
              indicator={<IconUserPlus size={28} strokeWidth={1.5} />}
              
              active={true}
            />
          </div>
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
