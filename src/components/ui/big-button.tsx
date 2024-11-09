"use client";

import React from "react";
import Link from "next/link";
import { LinkProps } from "next/link";

// Base button props that apply to both link and button versions
interface BaseButtonProps {
  title: string;
  indicator: React.ReactNode;
  direction?: "left" | "right";
  className?: string;
  disabled?: boolean;
  active?: boolean;
}

// Props specific to the button version
interface ButtonAsButtonProps extends BaseButtonProps {
  href?: never;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

// Props specific to the link version
interface ButtonAsLinkProps extends BaseButtonProps, Omit<LinkProps, "href"> {
  href: string;
  onClick?: never;
}

// Combined type for all possible button props
type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

const Button = ({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
  ...props
}: ButtonProps) => {
  // Base styles using Tailwind
  const baseStyles =
    "inline-flex items-center justify-center px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";

  // Variant styles
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
    outline:
      "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
  };

  const combinedStyles = `${baseStyles} ${variants[variant]} ${className} ${
    disabled ? "opacity-50 cursor-not-allowed" : ""
  }`;

  // If href is provided, render Next.js Link
  if (href) {
    return (
      <Link href={href} className={combinedStyles} {...props}>
        {children}
      </Link>
    );
  }

  // Otherwise render button with onClick
  return (
    <button
      onClick={onClick}
      className={combinedStyles}
      disabled={disabled}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
};

export default function BigButton({
  title = "Posted",
  indicator,
  href = "/",
  direction = "right",
  active = false,
}: {
  title: string;
  indicator: React.ReactNode;
  href: string;
  direction?: "left" | "right";
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex ${
        direction === "left" ? "flex-row-reverse" : "flex-row"
      } items-center h-12 rounded-full ${
        active && "bg-primary"
      } font-serif text-base font-bold text-dark`}
    >
      <span className={`${direction === "left" ? "pr-5 pl-3" : "pl-5 pr-3"}`}>
        {title}
      </span>
      <div
        className={`p-2 grid place-content-center w-12 h-12 rounded-full ${
          active && "bg-secondary"
        } scale-105 text-sm font-bold overflow-hidden`}
      >
        {indicator}
      </div>
    </Link>
  );
}
