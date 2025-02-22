"use client";

import React, { useState } from "react";

import BigButton from "@/components/ui/big-button";
import { IconArrowRight } from "@tabler/icons-react";
import { ContactReasonCombobox } from "@/components/ui/contact-reason-combobox";

export default function ContactForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    reason: "",
    message: "",
  });

  const [errorData, setErrorData] = useState({
    name: "",
    username: "",
    email: "",
    reason: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleReasonChange = (value: string) => {
    setFormData((prevState) => ({
      ...prevState,
      reason: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    setErrorData({
      name: "",
      username: "",
      email: "",
      reason: "",
      message: "",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-10 flex flex-col items-start gap-5 max-w-sm transition-all duration-300 ease-in-out"
    >
      <div className="flex flex-col gap-2 w-full transition-all duration-300 ease-in-out">
        <input
          type="text"
          name="name"
          value={formData.name}
          placeholder="Your name"
          onChange={handleChange}
          className="p-2 w-full focus:outline-none focus:ring-none border-b border-primary bg-transparent focus:bg-primary text-dark dark:text-light placeholder:text-dark/30 dark:placeholder:text-light/30 transition-all duration-300 ease-in-out"
        />
        {errorData.name && (
          <span className="text-sm text-red-600 dark:text-red-500">
            {errorData.name}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 w-full transition-all duration-300 ease-in-out">
        <input
          type="text"
          name="username"
          value={formData.username}
          placeholder="Your username (optional)"
          onChange={handleChange}
          className="p-2 w-full focus:outline-none focus:ring-none border-b border-primary bg-transparent focus:bg-primary text-dark dark:text-light placeholder:text-dark/30 dark:placeholder:text-light/30 transition-all duration-300 ease-in-out"
        />
      </div>

      <div className="flex flex-col gap-2 w-full transition-all duration-300 ease-in-out">
        <input
          type="email"
          name="email"
          value={formData.email}
          placeholder="Your email address"
          onChange={handleChange}
          className="p-2 w-full focus:outline-none focus:ring-none border-b border-primary bg-transparent focus:bg-primary text-dark dark:text-light placeholder:text-dark/30 dark:placeholder:text-light/30 transition-all duration-300 ease-in-out"
        />
        {errorData.email && (
          <span className="text-sm text-red-600 dark:text-red-500">
            {errorData.email}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 w-full transition-all duration-300 ease-in-out">
        <ContactReasonCombobox
          value={formData.reason}
          onChange={(value) => {
            setFormData((prevState) => ({
              ...prevState,
              reason: value,
            }));
          }}
        />
        {errorData.reason && (
          <span className="text-sm text-red-600 dark:text-red-500">
            {errorData.reason}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 w-full transition-all duration-300 ease-in-out">
        <textarea
          name="message"
          value={formData.message}
          placeholder="How can we help?"
          onChange={handleChange}
          className="p-2 h-24 w-full focus:outline-none focus:ring-none border-b border-primary bg-transparent focus:bg-primary text-dark dark:text-light placeholder:text-dark/30 dark:placeholder:text-light/30 transition-all duration-300 ease-in-out"
        />
        {errorData.message && (
          <span className="text-sm text-red-600 dark:text-red-500">
            {errorData.message}
          </span>
        )}
      </div>

      <BigButton
        title={isLoading ? "Sending your message..." : "Send Message"}
        indicator={<IconArrowRight size={26} strokeWidth={1.5} />}
        active={!isLoading}
        disabled={isLoading}
        type="submit"
        className="mt-5"
      />
    </form>
  );
}
