"use client";

import { useEffect, useRef, useState } from "react";

export default function LockedPanel() {
  const [pinValues, setPinValues] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(5);

  // Create refs for each input field
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Handle input change for individual PIN digit
  const handlePinDigitChange = (index: number, value: string) => {
    // Only allow a single digit
    const digit = value.replace(/\D/g, "").slice(0, 1);

    // Update the PIN values array
    const newPinValues = [...pinValues];
    newPinValues[index] = digit;
    setPinValues(newPinValues);

    // If a digit was entered and this is not the last input field, focus on the next field
    if (digit && index < pinValues.length - 1) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (pinValues[index] === "") {
        if (index > 0) {
          inputRefs[index - 1].current?.focus();
        }
      } else {
        // Clear current field
        const newPinValues = [...pinValues];
        newPinValues[index] = "";
        setPinValues(newPinValues);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs[index - 1].current?.focus();
    } else if (e.key === "ArrowRight" && index < pinValues.length - 1) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();

    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, pinValues.length);

    const newPinValues = [...pinValues];
    for (let i = 0; i < pastedData.length; i++) {
      newPinValues[i] = pastedData[i];
    }
    setPinValues(newPinValues);

    // Focus the appropriate field after pasting
    if (pastedData.length < pinValues.length) {
      inputRefs[pastedData.length].current?.focus();
    } else {
      inputRefs[pinValues.length - 1].current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const pin = pinValues.join("");

    if (pin.length !== pinValues.length) {
      setError("Please enter a complete PIN");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/pin/unlock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pin }),
      });

      setPinValues(["", "", "", ""]);
      const data = await response.json();

      if (response.ok) {
        // Redirect to where they were trying to go or explore
        window.location.href = data.redirectUrl || "/explore";
      } else {
        if (data.remainingAttempts !== undefined) {
          setRemainingAttempts(data.remainingAttempts);
        }
        setError(data.error || "Failed to unlock");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Clear PIN when showing error
  useEffect(() => {
    if (error) {
      setPinValues(["", "", "", ""]);
      // Focus first input when clearing
      inputRefs[0].current?.focus();
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-neutral-50 to-neutral-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-900">
            Locked
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600">
            Please enter your PIN to unlock.
          </p>
        </div>

        {/* PIN Pad in OTP style */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="flex justify-center space-x-4">
            {pinValues.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type={"password"}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-14 h-14 text-center text-2xl border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                aria-label={`PIN digit ${index + 1}`}
              />
            ))}
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
              {remainingAttempts > 0 && (
                <p className="mt-1">Attempts remaining: {remainingAttempts}</p>
              )}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || pinValues.some((digit) => digit === "")}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary focus:outline-none disabled:bg-primary/50"
            >
              {loading ? "Unlocking..." : "Unlock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
