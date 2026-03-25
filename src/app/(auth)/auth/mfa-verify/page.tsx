import MfaVerifyForm from "./mfa-verify-form";

export const metadata = {
  title: "Verify 2FA | Ostracon",
};

export default function MfaVerifyPage() {
  return (
    <main
      className="flex-grow flex flex-col h-full bg-light dark:bg-dark shadow-xl shadow-neutral-900/30"
      style={{ paddingTop: "60px" }}
    >
      <section className="flex-grow px-[25px] grid grid-cols-1 items-center">
        <article className="w-full max-w-xs mx-auto">
          <h1 className="font-serif text-3xl font-black mb-2">
            Two-Factor Verification
          </h1>
          <p className="text-muted-foreground mb-6">
            Enter the 6-digit code from your authenticator app
          </p>

          <MfaVerifyForm />
        </article>
      </section>
    </main>
  );
}
