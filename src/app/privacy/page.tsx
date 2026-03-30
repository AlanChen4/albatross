import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Albatross",
  description:
    "Privacy Policy for Albatross, the daily lateral thinking puzzle game.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link
        className="mb-10 inline-block text-muted-foreground text-sm transition-colors hover:text-foreground"
        href="/"
      >
        ← Back to game
      </Link>

      <h1 className="mb-2 text-4xl text-foreground">Privacy Policy</h1>
      <p className="mb-10 text-muted-foreground text-sm">
        Last updated: March 30, 2026
      </p>

      <div className="space-y-8 text-foreground text-lg leading-relaxed">
        <section>
          <h2 className="mb-3 text-2xl text-foreground">1. Overview</h2>
          <p>
            Albatross ("we", "our", or "us") operates the Albatross daily puzzle
            game. This Privacy Policy explains what information we collect, how
            we use it, and your rights regarding that information. We collect
            only what is necessary to operate the Service.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl text-foreground">
            2. Information We Collect
          </h2>

          <h3 className="mt-5 mb-2 text-foreground text-xl">
            2a. Information you provide
          </h3>
          <ul className="list-inside list-disc space-y-2">
            <li>
              <strong>Account information:</strong> If you create an account, we
              collect your email address and any display name you choose.
            </li>
            <li>
              <strong>Questions you submit:</strong> The text of each yes-or-no
              question you type while playing a puzzle, and any solution guesses
              you submit.
            </li>
          </ul>

          <h3 className="mt-5 mb-2 text-foreground text-xl">
            2b. Information collected automatically
          </h3>
          <ul className="list-inside list-disc space-y-2">
            <li>
              <strong>Game activity:</strong> Which puzzles you have played, the
              number of questions used, whether you solved the puzzle, and
              timestamps of activity.
            </li>
            <li>
              <strong>Anonymous session data:</strong> If you play without
              signing in, an anonymous session identifier is created
              automatically so we can save your progress within that session.
            </li>
            <li>
              <strong>Usage analytics:</strong> Aggregate, anonymised page-view
              and interaction data collected by Vercel Analytics. This does not
              include personally identifiable information and is used solely to
              understand how the Service is used.
            </li>
          </ul>

          <h3 className="mt-5 mb-2 text-foreground text-xl">
            2c. Information we do not collect
          </h3>
          <p>
            We do not collect payment information (the Service is free), precise
            location data, or data from your device beyond standard web request
            metadata (IP address, browser user-agent). We do not knowingly
            collect information from children under 13.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl text-foreground">
            3. How We Use Your Information
          </h2>
          <p>We use the information we collect to:</p>
          <ul className="mt-3 list-inside list-disc space-y-2">
            <li>
              Operate and deliver the Service, including tracking puzzle
              progress
            </li>
            <li>Authenticate you when you sign in</li>
            <li>
              Process your questions through an AI model to generate in-game
              responses
            </li>
            <li>Understand how the Service is used so we can improve it</li>
            <li>
              Respond to support requests or inquiries you send us directly
            </li>
          </ul>
          <p className="mt-4">
            We do not sell your personal information. We do not use your
            information to serve targeted advertising.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl text-foreground">
            4. How Your Questions Are Processed
          </h2>
          <p>
            When you submit a question during gameplay, the text of that
            question — along with the puzzle context — is sent to a third-party
            AI model provider to generate a yes-or-no response. This
            transmission is necessary for the core function of the game. The AI
            provider may log requests for safety and quality monitoring in
            accordance with their own policies. We do not use your questions to
            train AI models.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl text-foreground">
            5. Third-Party Services
          </h2>
          <p>
            We rely on the following third-party services to operate Albatross.
            Each has its own privacy policy governing how it handles data.
          </p>
          <ul className="mt-4 list-inside list-disc space-y-3">
            <li>
              <strong>Supabase</strong> — provides our database and
              authentication infrastructure. Your account data and game history
              are stored in Supabase-managed databases hosted on AWS. Supabase
              acts as a data processor on our behalf.
            </li>
            <li>
              <strong>Vercel</strong> — hosts the application and provides
              anonymised analytics. Vercel processes web request metadata
              (including IP addresses) as part of serving the application.
            </li>
            <li>
              <strong>AI model provider (via Vercel AI Gateway)</strong> —
              receives the text of your questions to generate in-game responses.
              Questions are not linked to your account when transmitted.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-2xl text-foreground">
            6. Cookies and Local Storage
          </h2>
          <p>
            The Service uses browser cookies and local storage solely for
            authentication (to keep you signed in between sessions) and to store
            your anonymous session token if you play without an account. We do
            not use tracking cookies or third-party advertising cookies.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl text-foreground">7. Data Retention</h2>
          <p>
            Your game history and account information are retained for as long
            as your account is active. Anonymous session data is retained for a
            limited period to support the core game experience and is then
            deleted. You may request deletion of your account and associated
            data at any time by contacting us (see Section 10).
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl text-foreground">8. Data Security</h2>
          <p>
            We implement reasonable technical and organisational measures to
            protect your information against unauthorised access, disclosure, or
            loss. However, no method of transmission over the internet or
            electronic storage is 100% secure. We cannot guarantee absolute
            security.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl text-foreground">9. Your Rights</h2>
          <p>
            Depending on where you live, you may have rights regarding your
            personal data, including the right to access, correct, or delete the
            data we hold about you, and the right to object to or restrict
            certain processing. To exercise any of these rights, contact us
            using the details in Section 10. We will respond within a reasonable
            timeframe and in accordance with applicable law.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl text-foreground">10. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, want to exercise
            your data rights, or would like to request deletion of your account,
            please email us at{" "}
            <a
              className="underline underline-offset-4"
              href="mailto:avchen4@gmail.com"
            >
              avchen4@gmail.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl text-foreground">
            11. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. The "last
            updated" date at the top of this page reflects the most recent
            revision. We encourage you to review this page periodically. Your
            continued use of the Service after changes are posted constitutes
            acceptance of the updated policy.
          </p>
        </section>
      </div>

      <div className="mt-12 border-border border-t pt-8">
        <Link
          className="text-muted-foreground text-sm underline underline-offset-4 transition-colors hover:text-foreground"
          href="/terms"
        >
          Read our Terms of Service
        </Link>
      </div>
    </div>
  );
}
