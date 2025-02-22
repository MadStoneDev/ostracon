"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const reasons = [
  { value: "account", label: "Account Issues" },
  { value: "technical", label: "Technical Problems" },
  { value: "feature", label: "Feature Request" },
  { value: "report", label: "Report Content/User" },
  { value: "privacy", label: "Privacy Concerns" },
  { value: "business", label: "Business Inquiry" },
  { value: "feedback", label: "General Feedback" },
  { value: "other", label: "Other" },
];

interface ContactReasonProps {
  value: string;
  onChange: (value: string) => void;
}

export function ContactReasonCombobox({ value, onChange }: ContactReasonProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const filteredReasons = React.useMemo(() => {
    if (!search) return reasons;
    return reasons.filter((reason) =>
      reason.label.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          role="combobox"
          aria-expanded={open}
          className={`p-2 w-full focus:outline-none border-b border-primary bg-transparent focus:bg-primary ${
            value
              ? "text-dark dark:text-light"
              : "text-dark/30 dark:text-light/30"
          } transition-all duration-300 ease-in-out flex items-center justify-between`}
        >
          {value
            ? reasons.find((reason) => reason.value === value)?.label
            : "Select a reason"}
          <IconChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search reason..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No reason found.</CommandEmpty>
            <CommandGroup>
              {filteredReasons.map(
                (
                  reason, // Changed from reasons to filteredReasons
                ) => (
                  <CommandItem
                    key={reason.value}
                    value={reason.value}
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    <IconCheck
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === reason.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {reason.label}
                  </CommandItem>
                ),
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
