import React from "react";
import ContactForm from "@/components/auth/contact-form";

export const metadata = {
  title: "Contact Us - Ostracon",
  description:
    "Get in touch with the Ostracon team and let us know how we can help.",
};

export default function ContactPage() {
  return (
    <main className={`flex-grow flex flex-col h-full`}>
      <section className={`flex-grow px-[25px] grid grid-cols-1 items-center`}>
        <article>
          <h1 className={`font-serif text-5xl font-black`}>Contact Us</h1>
          <h2 className={`font-serif text-xl`}>
            We'd love to hear from you! Please fill out the form below and we'll
            get back to you as soon as possible.
          </h2>

          <ContactForm />
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
