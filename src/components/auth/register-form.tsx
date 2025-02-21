"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/app/(auth)/register/actions";

import BigButton from "@/components/ui/big-button";

import {
  IconArrowRight,
  IconCheck,
  IconEye,
  IconEyeOff,
  IconX,
} from "@tabler/icons-react";

export default function RegisterForm() {
  // Hooks
  const router = useRouter();

  // States
  const [showPassword, setShowPassword] = useState(false);
  const [passwordActive, setPasswordActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [errorData, setErrorData] = useState({
    username: "",
    email: "",
    password: "",
    form: "",
  });

  const [passwordValidation, setPasswordValidation] = useState({
    atLeast8: false,
    atLeast1Uppercase: false,
    atLeast1Lowercase: false,
    atLeast1Number: false,
    atLeast1Special: false,
  });

  // Functions
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    if (name === "password") {
      handlePasswordValidation(value);
    }
  };

  const handlePasswordValidation = (password: string) => {
    const passwordLength = password.length;
    const passwordUppercase = password.match(/[A-Z]/g) || [];
    const passwordLowercase = password.match(/[a-z]/g) || [];
    const passwordNumber = password.match(/[0-9]/g) || [];
    const passwordSpecial = password.match(/[!@#$%^&*]/g) || [];

    setPasswordValidation((prevState) => ({
      ...prevState,
      atLeast8: passwordLength >= 8,
      atLeast1Uppercase: passwordUppercase.length >= 1,
      atLeast1Lowercase: passwordLowercase.length >= 1,
      atLeast1Number: passwordNumber.length >= 1,
      atLeast1Special: passwordSpecial.length >= 1,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    setErrorData((prevState) => ({
      username: "",
      email: "",
      password: "",
      form: "",
    }));

    if (formData.username.length < 3) {
      setErrorData((prevState) => ({
        ...prevState,
        username: "Username must be at least 3 characters long.",
      }));
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email.trim())) {
      setErrorData((prevState) => ({
        ...prevState,
        email: "Please enter a valid email address.",
      }));
      setIsLoading(false);
      return;
    }

    const isPasswordValid = Object.values(passwordValidation).every(
      (value) => value,
    );
    if (!isPasswordValid) {
      setErrorData((prevState) => ({
        ...prevState,
        password: "Please meet the minimum password requirements.",
      }));
      setIsLoading(false);
      return;
    }

    try {
      const response = await register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      if (response?.error) {
        setErrorData((prevState) => ({
          ...prevState,
          password: response.error || "Unknown error occured",
        }));
      } else {
        // Redirect handled by register action
      }
    } catch (error) {
      setErrorData((prevState) => ({
        ...prevState,
        form: "An error occurred. Please try again later.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`mt-10 flex flex-col items-start gap-5 max-w-sm transition-all duration-300 ease-in-out`}
    >
      <div
        className={`flex flex-col gap-2 w-full transition-all duration-300 ease-in-out`}
      >
        <input
          type={`text`}
          name={`username`}
          value={formData.username}
          placeholder={`Username`}
          onChange={handleChange}
          onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
            const username = event.target.value;

            if (username.length < 3) {
              setErrorData((prevState) => ({
                ...prevState,
                username: "Username must be at least 3 characters long.",
              }));
              return false;
            }
          }}
          className={`p-2 w-full focus:outline-none focus:ring-none border-b border-primary bg-transparent focus:bg-primary text-dark dark:text-light placeholder:text-dark/30 dark:placeholder:text-light/30 transition-all duration-300 ease-in-out`}
        />

        {errorData.username && (
          <span className={`text-sm text-red-600 dark:text-red-500`}>
            {errorData.username}
          </span>
        )}
      </div>

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

            if (trimmedEmail.length > 254) {
              setErrorData((prevState) => ({
                ...prevState,
                email: "Email address is too long.",
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

      <div
        className={`relative flex flex-col gap-2 w-full transition-all duration-300 ease-in-out`}
      >
        <input
          type={showPassword ? "text" : "password"}
          name={`password`}
          value={formData.password}
          placeholder={`Password`}
          onChange={handleChange}
          onFocus={() => setPasswordActive(true)}
          onBlur={() => setPasswordActive(false)}
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

        <div
          className={`px-1 flex flex-col gap-2 h-content overflow-hidden ${
            passwordActive ? "max-h-[9999px] py-2" : "max-h-0"
          } bg-dark/10 dark:bg-light/10 rounded-xl text-sm text-dark dark:text-light transition-all duration-300 ease-in-out`}
        >
          <span
            className={`flex items-center gap-2 opacity-50 transition-all duration-300 ease-in-out`}
          >
            {passwordValidation.atLeast8 ? (
              <IconCheck size={18} strokeWidth={1.5} />
            ) : (
              <IconX size={18} strokeWidth={1.5} />
            )}{" "}
            At least 8 characters
          </span>

          <span
            className={`flex items-center gap-2 opacity-50 transition-all duration-300 ease-in-out`}
          >
            {passwordValidation.atLeast1Uppercase ? (
              <IconCheck size={18} strokeWidth={1.5} />
            ) : (
              <IconX size={18} strokeWidth={1.5} />
            )}{" "}
            At least one uppercase letter
          </span>

          <span
            className={`flex items-center gap-2 opacity-50 transition-all duration-300 ease-in-out`}
          >
            {passwordValidation.atLeast1Lowercase ? (
              <IconCheck size={18} strokeWidth={1.5} />
            ) : (
              <IconX size={18} strokeWidth={1.5} />
            )}{" "}
            At least one lowercase letter
          </span>

          <span
            className={`flex items-center gap-2 opacity-50 transition-all duration-300 ease-in-out`}
          >
            {passwordValidation.atLeast1Number ? (
              <IconCheck size={18} strokeWidth={1.5} />
            ) : (
              <IconX size={18} strokeWidth={1.5} />
            )}{" "}
            At least one number
          </span>

          <span
            className={`flex items-center gap-2 opacity-50 transition-all duration-300 ease-in-out`}
          >
            {passwordValidation.atLeast1Special ? (
              <IconCheck size={18} strokeWidth={1.5} />
            ) : (
              <IconX size={18} strokeWidth={1.5} />
            )}{" "}
            At least one special character (eg. !@#$%^&*)
          </span>
        </div>
      </div>

      {errorData.form && (
        <span className="text-sm text-red-600 dark:text-red-500 w-full text-center">
          {errorData.form}
        </span>
      )}

      <BigButton
        title={isLoading ? "Creating Account..." : "Create Account"}
        indicator={<IconArrowRight size={26} strokeWidth={1.5} />}
        active={!isLoading}
        disabled={isLoading}
        type="submit"
        onClick={(e) => e.preventDefault()}
        className={`mt-5`}
      />
    </form>
  );
}
