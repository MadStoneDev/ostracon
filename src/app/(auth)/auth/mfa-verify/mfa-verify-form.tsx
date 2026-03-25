"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function MfaVerifyForm() {
  const router = useRouter();
  const supabase = createClient();

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;

    setIsLoading(true);
    try {
      // Get the TOTP factor
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.totp?.[0];

      if (!totpFactor) {
        toast({ title: "No 2FA factor found", variant: "destructive" });
        return;
      }

      // Create challenge
      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId: totpFactor.id });

      if (challengeError) {
        toast({ title: challengeError.message, variant: "destructive" });
        return;
      }

      // Verify
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challenge.id,
        code,
      });

      if (verifyError) {
        toast({
          title: "Invalid code. Please try again.",
          variant: "destructive",
        });
        setCode("");
        return;
      }

      // Success — redirect to explore
      router.push("/explore");
      router.refresh();
    } catch {
      toast({
        title: "Verification failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleVerify} className="space-y-4">
      <input
        type="text"
        value={code}
        onChange={(e) =>
          setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
        }
        placeholder="000000"
        className="w-full px-4 py-3 border-b border-primary bg-transparent text-center font-mono text-2xl tracking-[0.5em] focus:outline-none focus:bg-primary/5 transition-all duration-300"
        maxLength={6}
        inputMode="numeric"
        autoFocus
        disabled={isLoading}
      />

      <button
        type="submit"
        disabled={isLoading || code.length !== 6}
        className="w-full py-3 bg-dark dark:bg-light text-light dark:text-dark rounded-full font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isLoading ? "Verifying..." : "Verify"}
      </button>

      <button
        type="button"
        onClick={async () => {
          await supabase.auth.signOut();
          router.push("/auth");
        }}
        className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Sign out instead
      </button>
    </form>
  );
}
