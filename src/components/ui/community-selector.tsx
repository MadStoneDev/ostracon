"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Community {
  id: string;
  name: string;
  display_name: string;
}

interface CommunitySelectorProps {
  selectedCommunity: string | null;
  onChange: (communityId: string | null) => void;
}

export default function CommunitySelector({
  selectedCommunity,
  onChange,
}: CommunitySelectorProps) {
  const [open, setOpen] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const supabase = createClient();

  useEffect(() => {
    async function fetchUserCommunities() {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) throw new Error("User not authenticated");

        // First, get the group IDs where the user is a member
        const { data: memberData, error: memberError } = await supabase
          .from("group_members")
          .select("group_id")
          .eq("user_id", user.id);

        if (memberError) throw memberError;

        // Extract the group IDs to an array
        const groupIds = memberData.map((item) => item.group_id);

        // If user isn't a member of any groups, return early
        if (groupIds.length === 0) {
          setCommunities([]);
          setLoading(false);
          return;
        }

        // Fetch communities using the extracted IDs
        const { data, error: communitiesError } = await supabase
          .from("groups")
          .select("id, name, display_name")
          .in("id", groupIds);

        if (communitiesError) throw communitiesError;

        setCommunities(data || []);
      } catch (err) {
        console.error("Error fetching communities:", err);
        setError("Failed to load your communities");
      } finally {
        setLoading(false);
      }
    }

    fetchUserCommunities();
  }, [supabase]);

  // Filter communities based on search query
  const filteredCommunities = communities.filter((community) => {
    const displayName = community.display_name || community.name;
    return displayName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Get the display name for the selected community
  const getSelectedCommunityName = () => {
    if (!selectedCommunity) return "Public (no community)";

    const selected = communities.find((c) => c.id === selectedCommunity);
    return selected ? selected.display_name || selected.name : "Loading...";
  };

  if (loading) {
    return <div className="opacity-70">Loading communities...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {getSelectedCommunityName()}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search communities..."
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No communities found.</CommandEmpty>

            {/* Always show Public option regardless of search */}
            <CommandGroup heading="Post to">
              <CommandItem
                value="public"
                onSelect={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedCommunity === null ? "opacity-100" : "opacity-0",
                  )}
                />
                Public (no community)
              </CommandItem>
            </CommandGroup>

            {filteredCommunities.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Your Communities">
                  {filteredCommunities.map((community) => (
                    <CommandItem
                      key={community.id}
                      value={community.display_name || community.name}
                      onSelect={() => {
                        onChange(community.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCommunity === community.id
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {community.display_name || community.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
