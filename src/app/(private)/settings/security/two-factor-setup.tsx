"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  IconShieldCheck,
  IconShieldOff,
  IconCopy,
} from "@tabler/icons-react";

type TwoFactorSetupProps = {
  isMfaEnabled: boolean;
  factorId?: string;
};

export default function TwoFactorSetup({
  isMfaEnabled: initialEnabled,
  factorId: initialFactorId,
}: TwoFactorSetupProps) {
  const supabase = createClient();

  const [isMfaEnabled, setIsMfaEnabled] = useState(initialEnabled);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Enrollment state
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | undefined>(initialFactorId);
  const [verifyCode, setVerifyCode] = useState("");

  const handleEnroll = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Ostracon Authenticator",
      });

      if (error) {
        toast({ title: error.message, variant: "destructive" });
        return;
      }

      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
      setIsEnrolling(true);
    } catch {
      toast({ title: "Failed to start 2FA setup", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!factorId || verifyCode.length !== 6) return;

    setIsLoading(true);
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) {
        toast({ title: challenge.error.message, variant: "destructive" });
        return;
      }

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: verifyCode,
      });

      if (verify.error) {
        toast({ title: "Invalid code. Please try again.", variant: "destructive" });
        return;
      }

      setIsMfaEnabled(true);
      setIsEnrolling(false);
      setQrCode(null);
      setSecret(null);
      toast({ title: "Two-factor authentication enabled!" });
    } catch {
      toast({ title: "Verification failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!factorId) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) {
        toast({ title: error.message, variant: "destructive" });
        return;
      }

      setIsMfaEnabled(false);
      setFactorId(undefined);
      toast({ title: "Two-factor authentication disabled" });
    } catch {
      toast({ title: "Failed to disable 2FA", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      toast({ title: "Secret copied to clipboard" });
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-4">
        {isMfaEnabled ? (
          <IconShieldCheck size={24} className="text-green-500" />
        ) : (
          <IconShieldOff size={24} className="text-muted-foreground" />
        )}
        <div>
          <h2 className="text-lg font-semibold">Two-Factor Authentication</h2>
          <p className="text-sm text-muted-foreground">
            {isMfaEnabled
              ? "Your account is protected with 2FA"
              : "Add an extra layer of security to your account"}
          </p>
        </div>
      </div>

      {/* Enabled state */}
      {isMfaEnabled && !isEnrolling && (
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Enabled
          </span>
          <button
            onClick={handleDisable}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
          >
            {isLoading ? "..." : "Disable 2FA"}
          </button>
        </div>
      )}

      {/* Setup state */}
      {!isMfaEnabled && !isEnrolling && (
        <button
          onClick={handleEnroll}
          disabled={isLoading}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium"
        >
          {isLoading ? "Setting up..." : "Enable 2FA"}
        </button>
      )}

      {/* Enrollment flow */}
      {isEnrolling && qrCode && (
        <div className="mt-4 space-y-4">
          <p className="text-sm">
            Scan this QR code with your authenticator app (Google Authenticator,
            Authy, 1Password, etc.):
          </p>

          <div className="flex justify-center p-4 bg-white rounded-lg w-fit mx-auto">
            <Image
              src={qrCode}
              alt="2FA QR Code"
              width={200}
              height={200}
              unoptimized
            />
          </div>

          {secret && (
            <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
              <code className="flex-grow font-mono break-all">{secret}</code>
              <button
                onClick={copySecret}
                className="shrink-0 p-1 hover:text-primary transition-colors"
                title="Copy secret"
              >
                <IconCopy size={18} />
              </button>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              Enter the 6-digit code from your authenticator app:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={verifyCode}
                onChange={(e) =>
                  setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-center font-mono text-lg tracking-widest focus:outline-none focus:border-primary"
                maxLength={6}
                inputMode="numeric"
              />
              <button
                onClick={handleVerify}
                disabled={isLoading || verifyCode.length !== 6}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium"
              >
                {isLoading ? "..." : "Verify"}
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              setIsEnrolling(false);
              setQrCode(null);
              setSecret(null);
            }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel setup
          </button>
        </div>
      )}
    </div>
  );
}
