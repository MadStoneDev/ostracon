"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  loginWithPassword,
  loginWithMagicLink,
} from "@/app/(auth)/login/actions";

import BigButton from "@/components/ui/big-button";

import {
  IconArrowRight,
  IconEye,
  IconEyeOff,
  IconMail,
} from "@tabler/icons-react";

export default function LoginForm() {
  // Hooks
  const router = useRouter();

  // States
  const [showPassword, setShowPassword] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errorData, setErrorData] = useState({
    email: "",
    password: "",
    form: "",
  });

  // Functions
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorData({
      email: "",
      password: "",
      form: "",
    });

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email.trim())) {
      setErrorData((prevState) => ({
        ...prevState,
        email: "Please enter a valid email address.",
      }));
      setIsLoading(false);
      return;
    }

    try {
      if (useMagicLink) {
        const response = await loginWithMagicLink({
          email: formData.email.trim(),
        });

        if (response.success) {
          setMagicLinkSent(true);
        } else {
          setErrorData((prevState) => ({
            ...prevState,
            email: response.error || "Failed to send magic link",
          }));
        }
      } else {
        if (!formData.password) {
          setErrorData((prevState) => ({
            ...prevState,
            password: "Password is required",
          }));
          setIsLoading(false);
          return;
        }

        const loginResponse = await loginWithPassword({
          email: formData.email.trim(),
          password: formData.password,
        });

        if (loginResponse?.error) {
          setErrorData((prevState) => ({
            ...prevState,
            form: loginResponse.error,
          }));
          return;
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
        return;
      }

      console.error("Unexpected error during login:", error);
      setErrorData((prevState) => ({
        ...prevState,
        form: "An error occurred. Please try again later.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  if (magicLinkSent) {
    return (
      <div className="mt-10 flex flex-col gap-4">
        <div className={`flex items-center gap-4`}>
          <IconMail size={48} className="text-primary" />
          <h2 className="text-xl font-semibold">Check your email</h2>
        </div>
        <p className="text-dark/70 dark:text-light/70">
          We've sent you a magic link to{" "}
          <span className={"font-bold"}>{formData.email}</span>
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`mt-10 flex flex-col items-start gap-5 max-w-sm transition-all duration-300 ease-in-out`}
    >
      <div
        className={`flex flex-col gap-2 w-full transition-all duration-300 ease-in-out`}
      >
        <input
          type={`email`}
          name={`email`}
          value={formData.email}
          placeholder={`Email`}
          onChange={handleChange}
          onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
            const email = event.target.value;

            // Basic email regex pattern
            const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

            // Trim whitespace
            const trimmedEmail = email.trim();

            // Check for common validation rules
            if (!trimmedEmail) {
              setErrorData((prevState) => ({
                ...prevState,
                email: "Email address is required.",
              }));
              return false;
            }

            if (!emailRegex.test(trimmedEmail)) {
              // Provide more specific error messages based on common issues
              if (!trimmedEmail.includes("@")) {
                setErrorData((prevState) => ({
                  ...prevState,
                  email: "Email address must contain '@' symbol.",
                }));
                return false;
              }

              if (!trimmedEmail.includes(".")) {
                setErrorData((prevState) => ({
                  ...prevState,
                  email:
                    "Email address must contain a domain (e.g., .com, .org).",
                }));
                return false;
              }

              if (trimmedEmail.indexOf("@") === trimmedEmail.length - 1) {
                setErrorData((prevState) => ({
                  ...prevState,
                  email: "Please enter a domain after '@' symbol.",
                }));
                return false;
              }

              if (trimmedEmail.startsWith("@")) {
                setErrorData((prevState) => ({
                  ...prevState,
                  email: "Email address cannot start with '@' symbol.",
                }));
                return false;
              }

              setErrorData((prevState) => ({
                ...prevState,
                email: "Please enter a valid email address.",
              }));
              return false;
            }

            // Additional checks for common mistakes
            if (trimmedEmail.includes("..")) {
              setErrorData((prevState) => ({
                ...prevState,
                email: "Email address cannot contain consecutive dots.",
              }));
              return false;
            }

            if (trimmedEmail.split("@").length > 2) {
              setErrorData((prevState) => ({
                ...prevState,
                email: "Email address cannot contain multiple '@' symbols.",
              }));
              return false;
            }

            setErrorData((prevState) => ({
              ...prevState,
              email: "",
            }));
            return true;
          }}
          className={`p-2 w-full focus:outline-none focus:ring-none border-b border-primary bg-transparent focus:bg-primary text-dark dark:text-light placeholder:text-dark/30 dark:placeholder:text-light/30 transition-all duration-300 ease-in-out`}
        />

        {errorData.email && (
          <span className={`text-sm text-red-600 dark:text-red-500`}>
            {errorData.email}
          </span>
        )}
      </div>

      {!useMagicLink && (
        <div
          className={`relative flex flex-col gap-2 w-full transition-all duration-300 ease-in-out`}
        >
          <input
            type={showPassword ? "text" : "password"}
            name={`password`}
            value={formData.password}
            placeholder={`Password`}
            onChange={handleChange}
            className={`p-2 w-full focus:outline-none focus:ring-none border-b border-primary bg-transparent focus:bg-primary text-dark dark:text-light placeholder:text-dark/30 dark:placeholder:text-light/30 transition-all duration-300 ease-in-out`}
          />

          <button
            type={`button`}
            className={`absolute right-2 top-[10px] focus:outline-none hover:scale-110 text-dark/80 dark:text-light/80 hover:text-dark dark:hover:text-light transition-all duration-300 ease-in-out`}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <IconEyeOff size={24} strokeWidth={1.5} />
            ) : (
              <IconEye size={24} strokeWidth={1.5} />
            )}
          </button>

          <span className={`text-sm text-red-600 dark:text-red-500`}>
            {errorData.password}
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={() => setUseMagicLink(!useMagicLink)}
        className="-mt-3 text-primary hover:text-primary/80 transition-colors text-sm self-end"
      >
        {useMagicLink ? "Use password instead" : "Use magic link instead"}
      </button>

      {errorData.form && (
        <span className="text-sm text-red-600 dark:text-red-500 w-full text-center">
          {errorData.form}
        </span>
      )}

      <BigButton
        title={
          isLoading ? "Loading" : useMagicLink ? "Send Magic Link" : "Log me in"
        }
        indicator={<IconArrowRight size={26} strokeWidth={1.5} />}
        active={!isLoading}
        disabled={isLoading}
        type={`submit`}
        className={`mt-5`}
      />
    </form>
  );
}
