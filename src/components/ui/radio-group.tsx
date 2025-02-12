"use client";

import React, { useState } from "react";

export default function RadioGroup({
  options,
  selectedOption,
  setSelectedOption,
}: {
  options: { label: string; value: string }[];
  selectedOption: number | null;
  setSelectedOption: (value: number | null) => void;
}) {
  const handleChange = (index: number) => {
    setSelectedOption(index);
  };

  return (
    <section
      className={`py-4 flex flex-col gap-4 text-sm transition-all duration-300 ease-in-out`}
    >
      {options.map((option, index) => (
        <label
          key={index}
          className={`flex items-center gap-2 ${
            selectedOption === index ? "font-bold" : ""
          } transition-all duration-300 ease-in-out`}
        >
          <input
            type={`radio`}
            name={`radio-group`}
            value={options[index].value}
            checked={selectedOption === index}
            onChange={() => handleChange(index)}
          />
          <span>{options[index].label}</span>
        </label>
      ))}
    </section>
  );
}
