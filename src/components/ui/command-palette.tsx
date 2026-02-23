"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  IconHome,
  IconCompass,
  IconSearch,
  IconUsers,
  IconBell,
  IconMessage,
  IconUser,
  IconSettings,
  IconPlus,
  IconPencil,
} from "@tabler/icons-react";

export default function CommandPalette({
  username,
}: {
  username?: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
            <IconHome className="mr-2 h-4 w-4" />
            Home
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/explore"))}>
            <IconCompass className="mr-2 h-4 w-4" />
            Explore
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/search"))}>
            <IconSearch className="mr-2 h-4 w-4" />
            Search
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/connect"))}>
            <IconUsers className="mr-2 h-4 w-4" />
            Communities
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/notifications"))}>
            <IconBell className="mr-2 h-4 w-4" />
            Notifications
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/messages"))}>
            <IconMessage className="mr-2 h-4 w-4" />
            Messages
          </CommandItem>
          {username && (
            <CommandItem onSelect={() => runCommand(() => router.push(`/profile/${username}`))}>
              <IconUser className="mr-2 h-4 w-4" />
              Profile
            </CommandItem>
          )}
          <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
            <IconSettings className="mr-2 h-4 w-4" />
            Settings
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => runCommand(() => router.push("/post/new"))}>
            <IconPencil className="mr-2 h-4 w-4" />
            New Post
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/messages/new"))}>
            <IconPlus className="mr-2 h-4 w-4" />
            New Message
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
