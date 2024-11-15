"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { LinkProps } from "next/link";

interface BaseButtonProps {
  title: string;
  indicator: ReactNode;
  direction?: "left" | "right";
  active?: boolean;
  disabled?: boolean;
  className?: string;
}

interface ButtonAsButtonProps extends BaseButtonProps {
  href?: never;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

interface ButtonAsLinkProps extends BaseButtonProps, Omit<LinkProps, "href"> {
  href: string;
  onClick?: never;
}

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

export default function BigButton({
  title = "Posted",
  indicator,
  direction = "right",
  active = false,
  disabled = false,
  className = "",
  href,
  onClick,
}: ButtonProps) {
  const baseClassName = `group inline-flex ${
    direction === "left" ? "flex-row-reverse" : "flex-row"
  } items-center h-10 ${
    active ? "bg-primary text-dark" : "text-light hover:bg-primary/50"
  } font-serif text-sm font-bold text-dark transition-all duration-300 ease-in-out`;

  const contents = (
    <>
      <span
        className={`text-dark ${!active && "dark:text-light"} ${
          direction === "left" ? "pr-5 pl-3" : "pl-5 pr-3"
        }`}
      >
        {title}
      </span>
      <div
        className={`p-2 grid place-content-center w-10 h-10 text-dark ${
          active
            ? "bg-secondary dark:bg-secondary/80 scale-110"
            : "group-hover:bg-secondary/70 dark:text-light scale-105"
        } group-hover:scale-125 text-sm font-bold overflow-hidden transition-all duration-300 ease-in-out`}
      >
        {indicator}
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`${baseClassName} ${className}`}>
        {contents}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={`${baseClassName} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {contents}
    </button>
  );
}
