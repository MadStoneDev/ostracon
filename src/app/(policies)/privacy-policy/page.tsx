import React from "react";
import BottomNav from "@/components/ui/bottom-nav";
import Link from "next/link";

export default function PrivacyPolicy() {
  const authenticated = true;

  return (
    <main
      className={`relative flex-grow flex flex-col h-full`}
      style={{
        paddingTop: "60px",
        paddingBottom: "60px",
      }}
    >
      <div
        className={`fixed top-0 w-full h-[70px] bg-light dark:bg-dark z-10`}
      ></div>

      {/* Main Content */}
      <div
        className={`mt-4 flex-grow px-[25px] grid grid-cols-1 items-center max-w-md lg:max-w-xl`}
      >
        <h1 className="text-4xl font-serif mb-4">Privacy Policy</h1>
        <p className="mb-8">
          <strong>Last Updated: January 17, 2025</strong>
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-serif mb-4">1. Introduction</h2>
          <p className="mb-4">
            Welcome to Ostracon. We are committed to protecting your privacy and
            ensuring transparency in how we handle your data. This Privacy
            Policy explains our practices regarding the collection, use, and
            protection of your information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-serif mb-4">2. Information We Collect</h2>

          <h3 className="text-lg font-serif mb-3">
            2.1 Information You Provide
          </h3>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-2">
              Account information (username, email address, password)
            </li>
            <li className="mb-2">
              Profile information (display name, biography, profile picture)
            </li>
            <li className="mb-2">
              Date of birth (for age verification and NSFW content access)
            </li>
            <li className="mb-2">
              Content you post (text posts, comments, photos)
            </li>
            <li className="mb-2">Communications with other users</li>
            <li className="mb-2">Settings preferences</li>
          </ul>

          <h3 className="text-lg font-serif mb-3">
            2.2 Information Automatically Collected
          </h3>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-2">
              Log data (IP address, browser type, pages visited)
            </li>
            <li className="mb-2">
              Device information (device type, operating system)
            </li>
            <li className="mb-2">
              Usage information (interactions, time spent)
            </li>
          </ul>

          <h3 className="text-lg font-serif mb-3">
            2.3 Information We Do Not Collect
          </h3>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-2">
              Credit card information (handled by third-party payment
              processors)
            </li>
            <li className="mb-2">Precise geolocation data</li>
            <li className="mb-2">Biometric data</li>
            <li className="mb-2">Health information</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-serif mb-4">
            3. How We Use Your Information
          </h2>
          <p>We use your information to:</p>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-2">Provide and maintain the Ostracon service</li>
            <li className="mb-2">Process and display your content</li>
            <li className="mb-2">Enable communication between users</li>
            <li className="mb-2">Enforce our content moderation policies</li>
            <li className="mb-2">Send service-related notifications</li>
            <li className="mb-2">
              Protect against abuse and illegal activities
            </li>
            <li className="mb-2">Improve our services</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-serif mb-4">
            4. Information Sharing and Disclosure
          </h2>
          <h3 className="text-lg font-serif mb-3">
            4.1 Information Visible to Other Users
          </h3>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-2">Public posts</li>
            <li className="mb-2">Profile information</li>
            <li className="mb-2">Interaction with posts (likes, comments)</li>
          </ul>

          <h3 className="text-lg font-serif mb-3">
            4.2 Information We Do Not Share
          </h3>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-2">
              We do not sell your personal information to third parties
            </li>
            <li className="mb-2">
              We do not share your private messages with advertisers
            </li>
            <li className="mb-2">
              We do not use your data for targeted advertising
            </li>
            <li className="mb-2">We do not track you across other websites</li>
          </ul>

          <h3 className="text-lg font-serif mb-3">
            4.3 Limited Third-Party Sharing
          </h3>
          <p>We may share information with:</p>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-2">
              Service providers who assist in operating our platform
            </li>
            <li className="mb-2">Law enforcement when required by law</li>
            <li className="mb-2">Third parties with your explicit consent</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-serif mb-4">
            5. Data Protection and Security
          </h2>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-2">
              We employ industry-standard security measures
            </li>
            <li className="mb-2">
              All data is encrypted in transit and at rest
            </li>
            <li className="mb-2">Regular security audits are performed</li>
            <li className="mb-2">Access to user data is strictly limited</li>
            <li className="mb-2">
              We maintain detailed security incident response procedures
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-serif mb-4">
            6. Your Rights and Controls
          </h2>
          <p>You can:</p>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-2">Access your personal information</li>
            <li className="mb-2">Edit your profile and account information</li>
            <li className="mb-2">Delete your account and associated data</li>
            <li className="mb-2">Export your data</li>
            <li className="mb-2">Control visibility of your content</li>
            <li className="mb-2">Manage NSFW content preferences</li>
            <li className="mb-2">Control messaging permissions</li>
            <li className="mb-2">Opt out of email notifications</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-serif mb-4">7. Data Retention</h2>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-2">
              Active account data is retained until account deletion
            </li>
            <li className="mb-2">
              Deleted accounts are permanently removed within 30 days
            </li>
            <li className="mb-2">
              Backup data is retained for 90 days maximum
            </li>
            <li className="mb-2">
              Law enforcement request data is retained as required by law
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-serif mb-4">8. Children's Privacy</h2>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-2">
              Ostracon is not intended for users under 16
            </li>
            <li className="mb-2">
              We do not knowingly collect information from children under 16
            </li>
            <li className="mb-2">
              Accounts of users found to be under 16 will be terminated
            </li>
            <li className="mb-2">
              We will delete any information collected from users under 16
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-serif mb-4">9. Changes to This Policy</h2>
          <p className="mb-4">
            We will notify users of material changes via email and in-app
            notifications. Unless noted otherwise, changes become effective 30
            days after notification - Continued use after changes constitutes
            acceptance.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-serif mb-4">10. Contact Us</h2>
          <p>Coming Soon</p>
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

      {authenticated ? <BottomNav /> : null}
    </main>
  );
}
