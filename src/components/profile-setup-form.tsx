"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

import { updateUsername } from "@/app/(private)/profile/setup/actions";

export default function ProfileSetupForm() {
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );
  const [usernameChecking, setUsernameChecking] = useState(false);

  // Basic username validation
  const usernamePattern = /^[a-zA-Z0-9_]{3,30}$/;
  const isUsernameFormatValid = usernamePattern.test(username);

  // Username check with debounce
  const checkUsername = async (username: string) => {
    if (!isUsernameFormatValid) {
      setUsernameAvailable(null);
      return;
    }

    setUsernameChecking(true);

    try {
      // You can implement this server action to check username availability
      const response = await fetch(
        `/api/check-username?username=${encodeURIComponent(username)}`,
      );
      const data = await response.json();
      setUsernameAvailable(data.available);
    } catch (error) {
      console.error("Error checking username:", error);
      setUsernameAvailable(null);
    } finally {
      setUsernameChecking(false);
    }
  };

  // Debounce username check
  const handleUsernameChange = (value: string) => {
    setUsername(value);

    // Clear previous timer
    const timeoutId = setTimeout(() => {
      if (value && isUsernameFormatValid) {
        checkUsername(value);
      } else {
        setUsernameAvailable(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isUsernameFormatValid) {
      toast({
        title: "Invalid Username",
        description:
          "Username must be 3-30 characters and contain only letters, numbers, and underscores.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const result = await updateUsername({ username });

      if (result.success) {
        toast({
          title: "Profile Updated",
          description: "Your username has been set successfully.",
          variant: "default",
        });
        // Redirect will be handled by the server action
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update username.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Username update error:", error);
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
    <div className="w-full max-w-md mt-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium">
            Username
          </label>
          <div className="mt-1 relative">
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              className={`block w-full rounded-md border shadow-sm py-2 px-3 
                        bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                        focus:outline-none focus:ring-2 focus:ring-primary
                        ${
                          usernameAvailable === true
                            ? "border-green-500"
                            : usernameAvailable === false
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-700"
                        }`}
              placeholder="cooluser123"
              disabled={loading}
              maxLength={30}
            />
            {usernameChecking && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                  className="animate-spin h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            )}
            {!usernameChecking && usernameAvailable === true && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-green-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
            {!usernameChecking && usernameAvailable === false && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-red-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
          <div className="mt-1">
            {!isUsernameFormatValid && username && (
              <p className="text-xs text-red-500">
                Username must be 3-30 characters and contain only letters,
                numbers, and underscores.
              </p>
            )}
            {usernameAvailable === false && (
              <p className="text-xs text-red-500">
                This username is already taken.
              </p>
            )}
            {usernameAvailable === true && (
              <p className="text-xs text-green-500">Username is available!</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={
            loading || !isUsernameFormatValid || usernameAvailable !== true
          }
          className="w-full py-2 px-4 border border-transparent rounded-md 
                   shadow-sm text-sm font-medium text-white bg-primary 
                   hover:bg-primary-dark focus:outline-none focus:ring-2 
                   focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {loading ? "Saving..." : "Complete Profile"}
        </button>
      </form>
    </div>
  );
}
