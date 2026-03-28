"use client";

import { useState, useRef, useEffect } from "react";

import { useToast } from "@/hooks/use-toast";
import { IconSend } from "@tabler/icons-react";

import BigButton from "@/components/ui/big-button";
import Turnstile from "@/components/ui/turnstile";
import { requestOTP, verifyOTP, signInWithOAuth } from "@/app/(auth)/auth/actions";

export default function AuthForm() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await requestOTP({ email, turnstileToken: turnstileToken || undefined });
      if (result.success) {
        toast({
          title: "Success",
          description: "Sign-in link sent to your email",
          variant: "default",
        });
        setShowOTPInput(true);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send verification code",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("OTP request error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedValue = value.slice(0, 6);
      const newOtp = [...otp];

      for (let i = 0; i < pastedValue.length; i++) {
        if (i + index < 6) {
          // Only keep digits
          const digit = pastedValue[i].replace(/[^0-9]/g, "");
          if (digit) {
            newOtp[i + index] = digit;
          }
        }
      }

      setOtp(newOtp);

      // Focus on the appropriate input after paste
      const nextIndex = Math.min(index + pastedValue.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    // Normal single digit input
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input after entering a digit
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace - move to previous input if current is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter all 6 digits",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const result = await verifyOTP({ email, otp: otpString });
      if (result.success) {
        toast({
          title: "Success",
          description: "Authentication successful!",
          variant: "default",
        });
        // Redirect will happen automatically via the action
      } else {
        toast({
          title: "Error",
          description: result.error || "Verification failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const handleOAuthSignIn = async (provider: "google" | "github" | "apple") => {
    setOauthLoading(provider);
    try {
      const result = await signInWithOAuth(provider);
      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to sign in",
          variant: "destructive",
        });
        setOauthLoading(null);
      }
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setOauthLoading(null);
    }
  };

  return (
    <div className="w-full max-w-xs my-6">
      {!showOTPInput ? (
        <form onSubmit={handleRequestOTP} className="space-y-6">
          <div>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`p-2 w-full focus:outline-none focus:ring-none border-b border-primary bg-transparent focus:bg-primary text-dark dark:text-light placeholder:text-dark/30 dark:placeholder:text-light/30 transition-all duration-300 ease-in-out`}
              placeholder="Email"
              disabled={loading}
            />
          </div>

          <Turnstile
            onVerify={setTurnstileToken}
            onExpire={() => setTurnstileToken(null)}
          />

          <BigButton
            type="submit"
            title={loading ? "Sending..." : "Send Sign-In Link"}
            active={!loading}
            disabled={loading || email.trim().length === 0}
            indicator={<IconSend />}
            className={`mt-5`}
          />

          {/* Divider */}
          <div className="flex items-center gap-3 mt-6">
            <div className="flex-grow h-px bg-dark/20 dark:bg-light/20" />
            <span className="text-xs text-dark/50 dark:text-light/50">or continue with</span>
            <div className="flex-grow h-px bg-dark/20 dark:bg-light/20" />
          </div>

          {/* OAuth Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => handleOAuthSignIn("google")}
              disabled={!!oauthLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-dark/20 dark:border-light/20 hover:bg-dark/5 dark:hover:bg-light/5 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              {oauthLoading === "google" ? "..." : "Google"}
            </button>
            <button
              type="button"
              onClick={() => handleOAuthSignIn("github")}
              disabled={!!oauthLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-dark/20 dark:border-light/20 hover:bg-dark/5 dark:hover:bg-light/5 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              {oauthLoading === "github" ? "..." : "GitHub"}
            </button>
            <button
              type="button"
              onClick={() => handleOAuthSignIn("apple")}
              disabled={!!oauthLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-dark/20 dark:border-light/20 hover:bg-dark/5 dark:hover:bg-light/5 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              {oauthLoading === "apple" ? "..." : "Apple"}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <h3 className="font-bold mb-1">Check your email</h3>
            <p className="text-sm text-muted-foreground">
              We sent a sign-in link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Click the link in the email to sign in. It expires in 1 hour.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowOTPInput(false)}
              className="text-primary hover:underline text-sm font-bold"
            >
              Use a different email
            </button>
            <button
              type="button"
              onClick={handleRequestOTP}
              className="text-primary hover:underline text-sm font-bold"
              disabled={loading}
            >
              {loading ? "Sending..." : "Resend link"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
