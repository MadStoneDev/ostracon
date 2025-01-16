"use client";

import React, { useState } from "react";
import BigButton from "@/components/ui/big-button";
import {
  IconArrowRight,
  IconCheck,
  IconEye,
  IconEyeOff,
  IconX,
} from "@tabler/icons-react";

export default function LoginForm() {
  // States
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errorData, setErrorData] = useState({
    email: "",
    password: "",
  });

  // Functions
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <form
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

      <BigButton
        title={"Log me in"}
        indicator={<IconArrowRight size={26} strokeWidth={1.5} />}
        href={`/register`}
        active={true}
        className={`mt-5`}
      />
    </form>
  );
}
