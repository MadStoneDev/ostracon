"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface YearDatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  disabled?: boolean;
}

export function YearDatePicker({
  value,
  onChange,
  disabled,
}: YearDatePickerProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1900 + 1 },
    (_, i) => currentYear - i,
  );

  const [isOpen, setIsOpen] = useState(false);
  // Keep track of the currently displayed month/year
  const [displayDate, setDisplayDate] = useState<Date>(value || new Date());

  return (
    <Popover open={isOpen && !disabled} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={`px-4 py-2 text-left border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
            disabled
              ? "opacity-50 cursor-not-allowed bg-gray-100"
              : "hover:bg-gray-50"
          }`}
          disabled={disabled}
        >
          {value ? format(value, "MMMM d, yyyy") : "Set your date of birth"}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col gap-2 p-3">
          <Select
            value={displayDate.getFullYear().toString()}
            onValueChange={(year) => {
              const newDate = new Date(displayDate);
              newDate.setFullYear(parseInt(year));
              setDisplayDate(newDate);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date);
              setIsOpen(false);
            }}
            disabled={disabled}
            initialFocus
            defaultMonth={displayDate}
            month={displayDate}
            onMonthChange={setDisplayDate}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
