import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-col min-h-full">
      {/* Header Bar */}
      <nav className={`flex justify-between items-center h-[60px]`}>
        <div className={`font-serif font-black text-sm uppercase`}>
          Ostracon
        </div>
      </nav>

      {/* Main Content */}
      <section className={`flex-grow grid grid-cols-1 items-center`}>
        <article>
          <h1 className={`font-serif text-5xl font-black`}>Welcome!</h1>
          <h2 className={`font-serif text-xl`}>Let's create a new account</h2>

          <button
            className={`mt-5 py-3 px-5 flex rounded-full bg-primary font-serif text-xl`}
          >
            Start creating
            <div
              className={`h-full aspect-square rounded-full bg-secondary`}
            ></div>
          </button>
        </article>
      </section>

      {/* Navigation Bar */}
    </main>
  );
}
