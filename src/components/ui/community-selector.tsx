"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { IconX } from "@tabler/icons-react";

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
  const [communities, setCommunities] = useState<Community[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Fetch communities on component mount
  useEffect(() => {
    async function fetchUserCommunities() {
      try {
        setLoading(true);
        setError(null);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) throw new Error("User not authenticated");

        const { data: memberData, error: memberError } = await supabase
          .from("community_members")
          .select("community_id")
          .eq("user_id", user.id);

        if (memberError) throw memberError;

        const communityIds = memberData.map((item) => item.community_id);

        if (communityIds.length === 0) {
          setCommunities([]);
          setLoading(false);
          return;
        }

        const { data, error: communitiesError } = await supabase
          .from("communities")
          .select("id, name, display_name")
          .in("id", communityIds);

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

  // Filter communities when search query changes
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const filtered = communities.filter((community) => {
        const displayName = community.display_name || community.name;
        return displayName.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setFilteredCommunities(filtered);
    } else {
      setFilteredCommunities([]);
    }
  }, [searchQuery, communities]);

  const handleCommunitySelect = (community: Community) => {
    onChange(community.id);
    setSearchQuery("");
    setFilteredCommunities([]);
  };

  const handleSpecialSelect = (type: "public" | "draft") => {
    onChange(type === "public" ? null : "draft");
    setSearchQuery("");
    setFilteredCommunities([]);
  };

  if (loading) return <div>Loading communities...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="flex flex-wrap gap-2 items-center text-sm">
      {/* Special selection pills */}
      <div className="flex gap-2">
        <button
          onClick={() => handleSpecialSelect("public")}
          className={`
            px-3 py-1 rounded-full border focus:border-primary outline-none 
            ${
              selectedCommunity === null
                ? "bg-primary text-white"
                : "bg-neutral-200 text-neutral-600"
            } transition-all duration-200 ease-in-out
          `}
        >
          Public
        </button>
        <button
          onClick={() => handleSpecialSelect("draft")}
          className={`
            px-3 py-1 rounded-full border focus:border-primary outline-none 
            ${
              selectedCommunity === "draft"
                ? "bg-primary text-white"
                : "bg-neutral-200 text-neutral-600"
            } transition-all duration-200 ease-in-out
          `}
        >
          Save as Draft
        </button>
      </div>

      {/* Selected Community Pill (if any) */}
      {selectedCommunity &&
        selectedCommunity !== "draft" &&
        selectedCommunity !== null && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-600">
            {communities.find((c) => c.id === selectedCommunity)
              ?.display_name || "Community"}
            <button onClick={() => onChange(null)}>
              <IconX size={16} />
            </button>
          </div>
        )}

      {/* Community Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Select a community..."
          className="border focus:border-primary outline-none rounded px-2 py-1 w-full transition-all duration-200 ease-in-out"
        />

        {/* Autocomplete Dropdown */}
        {filteredCommunities.length > 0 && (
          <ul className="absolute z-10 bg-white border rounded shadow-lg w-full mt-1">
            {filteredCommunities.map((community) => (
              <li
                key={community.id}
                onClick={() => handleCommunitySelect(community)}
                className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
              >
                {community.display_name || community.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
