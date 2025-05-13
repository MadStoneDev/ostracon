import React from "react";
import BottomNav from "@/components/ui/bottom-nav";
import Link from "next/link";

export default function InfoPage() {
  return (
    <main
      className={`relative flex-grow flex flex-col h-full bg-light dark:bg-dark shadow-xl shadow-neutral-900/30`}
    >
      {/* Main Content */}
      <div
        className={`mt-4 flex-grow px-[25px] grid grid-cols-1 items-center max-w-md lg:max-w-xl`}
      >
        <h1 className={`text-4xl font-serif mb-4`}>What is Ostracon?</h1>
        <p className={`mb-8`}>
          <strong>Your platform for authentic expression</strong>
        </p>

        <section className={`mb-8`}>
          <h2 className={`mb-4 text-xl font-serif font-bold`}>Our Vision</h2>
          <p className={`mb-4`}>
            Ostracon is a text-based social platform designed to create a safe
            space for genuine self-expression. In ancient Greece, an "ostracon"
            was a pottery shard used for voting and messages—a simple yet
            powerful medium for expression. Our platform embodies this spirit,
            providing a canvas for your thoughts, stories, and ideas in their
            most authentic form.
          </p>
        </section>

        <section className={`mb-8`}>
          <h2 className={`mb-4 text-xl font-serif font-bold`}>
            What Makes Us Different
          </h2>

          <h3 className={`text-lg font-serif mb-3`}>Text-First Approach</h3>
          <p className={`mb-4`}>
            In a world of fleeting visual content, Ostracon celebrates the
            written word. We believe thoughtful text creates deeper connections
            and more meaningful interactions. Here, your words take center
            stage.
          </p>

          <h3 className={`text-lg font-serif mb-3`}>
            Fragment-Based Communication
          </h3>
          <p className={`mb-4`}>
            On Ostracon, you share "fragments"—pieces of your thoughts,
            experiences, and creativity. These fragments can be short or long,
            polished or raw. They're authentic pieces of who you are and what
            you think.
          </p>
        </section>

        <section className={`mb-8`}>
          <h2 className={`mb-4 text-xl font-serif font-bold`}>
            Express Yourself Through Fragments
          </h2>
          <p className={`mb-4`}>Share a variety of content such as:</p>
          <ul className={`list-disc ml-6 mb-4`}>
            <li className={`mb-2`}>Personal stories and experiences</li>
            <li className={`mb-2`}>Creative writing and poetry</li>
            <li className={`mb-2`}>Honest thoughts and reflections</li>
            <li className={`mb-2`}>
              Rants and vents in a supportive environment
            </li>
            <li className={`mb-2`}>Ideas and thought experiments</li>
            <li className={`mb-2`}>Daily observations and musings</li>
          </ul>
        </section>

        <section className={`mb-8`}>
          <h2 className={`mb-4 text-xl font-serif font-bold`}>
            A Safe Space for Authentic Expression
          </h2>
          <p className={`mb-4`}>At Ostracon, we prioritize:</p>
          <ul className={`list-disc ml-6 mb-4`}>
            <li className={`mb-2`}>
              Psychological safety for vulnerable expression
            </li>
            <li className={`mb-2`}>Protection from harassment and judgment</li>
            <li className={`mb-2`}>
              Content moderation that preserves authentic voices
            </li>
            <li className={`mb-2`}>
              Community standards that encourage respectful interaction
            </li>
            <li className={`mb-2`}>Privacy controls that put you in charge</li>
          </ul>
        </section>

        <section className={`mb-8`}>
          <h2 className={`mb-4 text-xl font-serif font-bold`}>
            Building Meaningful Connections
          </h2>
          <p className={`mb-4`}>Ostracon helps you:</p>
          <ul className={`list-disc ml-6 mb-4`}>
            <li className={`mb-2`}>
              Find like-minded individuals who appreciate your perspective
            </li>
            <li className={`mb-2`}>
              Engage in deeper, more thoughtful conversations
            </li>
            <li className={`mb-2`}>Discover new ideas and viewpoints</li>
            <li className={`mb-2`}>
              Form connections based on authentic expression
            </li>
            <li className={`mb-2`}>
              Grow as a writer and thinker through community feedback
            </li>
          </ul>
        </section>

        <section className={`mb-8`}>
          <h2 className={`mb-4 text-xl font-serif font-bold`}>
            Our Community Principles
          </h2>
          <ul className={`list-disc ml-6 mb-4`}>
            <li className={`mb-2`}>Authenticity over perfection</li>
            <li className={`mb-2`}>Respect for diverse perspectives</li>
            <li className={`mb-2`}>
              Thoughtful engagement over quick reactions
            </li>
            <li className={`mb-2`}>Support for vulnerability and honesty</li>
            <li className={`mb-2`}>Privacy and control over your content</li>
          </ul>
        </section>

        <section className={`mb-8`}>
          <h2 className={`mb-4 text-xl font-serif font-bold`}>
            Getting Started
          </h2>
          <p className={`mb-4`}>Join Ostracon in three simple steps:</p>
          <ul className={`list-disc ml-6 mb-4`}>
            <li className={`mb-2`}>Create your account</li>
            <li className={`mb-2`}>Customize your profile</li>
            <li className={`mb-2`}>Share your first fragment</li>
          </ul>
          <p className={`mb-4`}>
            Begin your journey of authentic expression today and connect with a
            community that values your voice.
          </p>
        </section>

        <section className={`mb-8`}>
          <h2 className={`mb-4 text-xl font-serif font-bold`}>
            Ready to Join?
          </h2>
          <p className={`mb-4`}>
            Become part of a growing community of writers, thinkers, and
            authentic voices. Start sharing your fragments and discover the
            power of text-based connection.
          </p>
          <div className={`flex gap-4 mt-6`}>
            <Link
              href={`/auth`}
              className={`bg-primary text-white px-6 py-3 rounded-md font-bold`}
            >
              Give Me Access!
            </Link>
          </div>
        </section>
      </div>

      <footer
        className={`px-[25px] flex flex-col justify-center items-start h-[60px]`}
      >
        <p className={`text-xs text-dark/50 dark:text-light/50`}>
          Copyright © 2025 Ostracon. All rights reserved.
        </p>
        <div className={`flex gap-2 text-xs`}>
          <Link href={`/privacy-policy`} className={`text-primary font-bold`}>
            Privacy Policy
          </Link>
          <Link href={`/terms-of-service`} className={`text-primary font-bold`}>
            Terms of Service
          </Link>
        </div>
      </footer>
    </main>
  );
}
