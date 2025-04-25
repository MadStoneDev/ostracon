"use client";

import { useState, useRef, useEffect } from "react";

import { useToast } from "@/hooks/use-toast";
import { IconSend } from "@tabler/icons-react";

import BigButton from "@/components/ui/big-button";
import { requestOTP, verifyOTP } from "@/app/(auth)/auth/actions";

export default function AuthForm() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOTPInput, setShowOTPInput] = useState(false);
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
      const result = await requestOTP({ email });
      if (result.success) {
        toast({
          title: "Success",
          description: "Verification code sent to your email",
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

          <BigButton
            type="submit"
            title={loading ? "Sending..." : "Send Magic Code"}
            active={!loading}
            disabled={loading || email.trim().length === 0}
            indicator={<IconSend />}
            className={`mt-5`}
          />
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Enter the 6-digit code sent to your email
            </label>
            <div className="flex gap-2 justify-between">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  ref={(el: HTMLInputElement | null) => {
                    if (inputRefs.current) {
                      inputRefs.current[index] = el;
                    }
                  }}
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedData = e.clipboardData.getData("text");
                    handleOTPChange(index, pastedData);
                  }}
                  className="w-10 h-12 focus:outline-none focus:ring-none border-b border-primary bg-transparent focus:bg-primary text-center text-dark dark:text-light placeholder:text-dark/30 dark:placeholder:text-light/30 text-lg font-bold transition-all duration-300 ease-in-out"
                  maxLength={1}
                  autoFocus={index === 0}
                  disabled={loading}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowOTPInput(false)}
              className="text-primary hover:underline text-sm font-bold"
              disabled={loading}
            >
              Change email
            </button>
            <button
              type="button"
              onClick={handleRequestOTP}
              className="text-primary hover:underline text-sm font-bold"
              disabled={loading}
            >
              Resend code
            </button>
          </div>

          <BigButton
            type="submit"
            title={loading ? "Verifying..." : "Verify & Continue"}
            active={!loading}
            disabled={loading || otp.join("").length !== 6}
            indicator={<IconSend />}
          />
        </form>
      )}
    </div>
  );
}
