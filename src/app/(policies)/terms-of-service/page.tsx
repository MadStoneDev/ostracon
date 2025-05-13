import BottomNav from "@/components/ui/bottom-nav";
import React from "react";
import Link from "next/link";

export default function TermsOfService() {
  return (
    <main className={`relative flex-grow flex flex-col h-full`}>
      {/* Main Content */}
      <div className="mt-4 flex-grow px-[25px] grid grid-cols-1 items-center max-w-md lg:max-w-xl">
        <h1 className="text-4xl font-serif mb-4">Terms of Service</h1>
        <p className="mb-8">
          <strong>Last Updated: January 17, 2025</strong>
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-serif mb-4">1. Agreement to Terms</h2>
          <p className="mb-4">
            By accessing or using Ostracon, you agree to be bound by these Terms
            of Service ("Terms"). If you disagree with any part of the terms,
            you may not access the service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-serif mb-4">2. Account Registration</h2>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-2">
              You must be 16 years or older to use Ostracon
            </li>
            <li className="mb-2">
              You must provide accurate and complete information
            </li>
            <li className="mb-2">
              You are responsible for maintaining account security
            </li>
            <li className="mb-2">
              One person or entity may not maintain multiple accounts
            </li>
            <li className="mb-2">Account sharing is prohibited</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-serif mb-4">3. Content Guidelines</h2>

          <h3 className="text-lg font-serif mb-3">3.1 Acceptable Content</h3>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-2">Text posts</li>
            <li className="mb-2">Profile photos (must be SFW)</li>
            <li className="mb-2">Comments and responses</li>
            <li className="mb-2">Community interactions</li>
            <li className="mb-2">Private messages</li>
          </ul>

          <h3 className="text-lg font-serif mb-3">3.2 Prohibited Content</h3>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-2">Illegal content</li>
            <li className="mb-2">
              Content promoting violence or criminal activity
            </li>
            <li className="mb-2">Child exploitation material</li>
            <li className="mb-2">Hate speech or discrimination</li>
            <li className="mb-2">Harassment or bullying</li>
            <li className="mb-2">Spam or misleading content</li>
            <li className="mb-2">Impersonation of others</li>
            <li className="mb-2">Copyright or trademark infringement</li>
          </ul>

          <h3 className="text-lg font-serif mb-3">3.3 NSFW Content</h3>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-2">Must be properly tagged</li>
            <li className="mb-2">Not allowed in profile pictures</li>
            <li className="mb-2">Only viewable by verified adult users</li>
            <li className="mb-2">Subject to content moderation</li>
            <li className="mb-2">Must comply with all applicable laws</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-serif mb-4">4. User Conduct</h2>
          <p className="mb-4">Users must not:</p>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-2">Violate any laws or regulations</li>
            <li className="mb-2">Harass or abuse other users</li>
            <li className="mb-2">Post illegal or prohibited content</li>
            <li className="mb-2">Attempt to manipulate the platform</li>
            <li className="mb-2">Sell or transfer accounts</li>
            <li className="mb-2">
              Use automated systems or bots without permission
            </li>
            <li className="mb-2">Attempt to access private information</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-serif mb-4">5. Content Moderation</h2>
          <p className="mb-4">We reserve the right to:</p>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-2">Remove any content</li>
            <li className="mb-2">Suspend or terminate accounts</li>
            <li className="mb-2">Issue warnings or strikes</li>
            <li className="mb-2">Modify or delete inappropriate content</li>
            <li className="mb-2">Report illegal activities to authorities</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-serif mb-4">6. Intellectual Property</h2>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-2">You retain rights to your content</li>
            <li className="mb-2">
              You grant us license to display your content
            </li>
            <li className="mb-2">
              You must respect others' intellectual property rights
            </li>
            <li className="mb-2">DMCA notices will be honored</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-serif mb-4">
            7. Privacy and Communication
          </h2>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-2">
              Private messaging is available between users
            </li>
            <li className="mb-2">
              Non-mutual messages require explicit acceptance
            </li>
            <li className="mb-2">Users can control messaging permissions</li>
            <li className="mb-2">Privacy settings can be customized</li>
            <li className="mb-2">Communication preferences can be modified</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-serif mb-4">8. Platform Rules</h2>

          <h3 className="text-lg font-serif mb-3">8.1 Strike System</h3>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-2">Violations result in strikes</li>
            <li className="mb-2">
              Multiple strikes lead to account suspension
            </li>
            <li className="mb-2">
              Serious violations result in immediate termination
            </li>
            <li className="mb-2">Appeals process is available</li>
          </ul>

          <h3 className="text-lg font-serif mb-3">8.2 Community Guidelines</h3>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-2">Respectful communication required</li>
            <li className="mb-2">No harassment or bullying</li>
            <li className="mb-2">No hate speech</li>
            <li className="mb-2">No illegal activities</li>
            <li className="mb-2">No spam or manipulation</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-serif mb-4">9. Termination</h2>
          <p className="mb-4">
            We may terminate or suspend your account if you:
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-2">Violate these Terms</li>
            <li className="mb-2">Engage in illegal activities</li>
            <li className="mb-2">Harass other users</li>
            <li className="mb-2">Post prohibited content</li>
            <li className="mb-2">Create multiple accounts</li>
            <li className="mb-2">Manipulate the platform</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-serif mb-4">
            10. Disclaimers and Limitations
          </h2>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-2">Service provided "as is"</li>
            <li className="mb-2">No warranties of any kind</li>
            <li className="mb-2">Limitation of liability</li>
            <li className="mb-2">Indemnification requirements</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-serif mb-4">11. Changes to Terms</h2>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-2">Terms may be updated periodically</li>
            <li className="mb-2">Users will be notified of changes</li>
            <li className="mb-2">Continued use constitutes acceptance</li>
            <li className="mb-2">30-day notice for material changes</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-serif mb-4">12. Governing Law</h2>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-2">Applicable jurisdiction</li>
            <li className="mb-2">Dispute resolution procedures</li>
            <li className="mb-2">Arbitration agreement</li>
            <li className="mb-2">Class action waiver</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-serif mb-4">13. Contact Information</h2>
          <p className="mb-4">
            [Contact details for Terms of Service inquiries]
          </p>
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
