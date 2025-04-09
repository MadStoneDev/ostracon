"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function LockedScreen() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const router = useRouter();
  const { returnTo } = router.query;

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, "");
    setPin(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!pin) {
      setError("PIN is required");
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

      const data = await response.json();

      if (response.ok) {
        // Redirect to where they were trying to go or dashboard
        const redirectPath = returnTo ? String(returnTo) : "/dashboard";
        router.push(redirectPath);
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
      setPin("");
    }
  }, [error]);

  return (
    <>
      <Head>
        <title>Account Locked</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Account Locked
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please enter your PIN to unlock.
            </p>
          </div>

          {/* PIN Pad */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="pin" className="sr-only">
                PIN
              </label>
              <input
                id="pin"
                name="pin"
                type="password"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={8}
                value={pin}
                onChange={handlePinChange}
                placeholder="Enter your PIN"
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-center text-2xl tracking-widest"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
                {remainingAttempts > 0 && (
                  <p className="mt-1">
                    Attempts remaining: {remainingAttempts}
                  </p>
                )}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading || !pin}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
              >
                {loading ? "Unlocking..." : "Unlock"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
