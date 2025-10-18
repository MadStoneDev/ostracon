"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { IconTrash, IconX } from "@tabler/icons-react";
import type { Database } from "../../../database.types";

type Community = Database["public"]["Tables"]["communities"]["Row"];

interface CommunitySelectorProps {
  selectedCommunity: Community | null | "public" | "draft";
  onChange: (community: Community | null | "public" | "draft") => void;
  communities: Community[];
}

export default function CommunitySelector({
  selectedCommunity,
  onChange,
  communities,
}: CommunitySelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Memoize filtering to prevent unnecessary re-renders
  const filteredCommunities = useMemo(() => {
    if (searchQuery.length < 2) return [];

    return communities.filter((community) => {
      const displayName = (
        community.display_name || community.name
      ).toLowerCase();
      return displayName.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, communities]);

  // Handle clicks outside the container
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        exitSearchMode();
      }
    };

    if (isSearchMode) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isSearchMode]);

  const exitSearchMode = () => {
    setIsSearchMode(false);
    setSearchQuery("");
  };

  const handleCommunitySelect = (community: Community) => {
    onChange(community);
    setSearchQuery("");
    setIsSearchMode(false);
  };

  const handleSpecialSelect = (type: "public" | "draft") => {
    onChange(type);
    setSearchQuery("");
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          Math.min(prev + 1, filteredCommunities.length - 1),
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
        break;

      case "Enter":
        e.preventDefault();
        if (filteredCommunities.length > 0) {
          const selectedCommunity = filteredCommunities[highlightedIndex];
          handleCommunitySelect(selectedCommunity);
        }
        break;

      case "Escape":
        e.preventDefault();
        exitSearchMode();
        break;
    }
  };

  // Determine the display name for a selected community
  const getSelectedCommunityName = () => {
    if (typeof selectedCommunity === "string") {
      return selectedCommunity === "draft" ? "Save as Draft" : "Public";
    }
    return (
      selectedCommunity?.display_name || selectedCommunity?.name || "Community"
    );
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex gap-2 items-center max-h-8 text-sm overflow-hidden`}
    >
      {/* Default and Selected States */}
      <div
        className={`flex-shrink-0 flex gap-2 max-h-8 ${
          isSearchMode ? "max-w-0" : "max-w-[999px]"
        } overflow-hidden transition-all duration-200 ease-in-out`}
      >
        {/* Public Pill */}
        <button
          onClick={() => handleSpecialSelect("public")}
          className={`
            px-3 py-1 rounded-full border focus:border-primary outline-none transition-all duration-300 ease-in-out
            ${
              selectedCommunity === "public"
                ? "bg-primary text-white"
                : "bg-neutral-200 text-neutral-600"
            }
          `}
        >
          Public
        </button>

        {/* Draft Pill */}
        <button
          onClick={() => handleSpecialSelect("draft")}
          className={`
            px-3 py-1 rounded-full border focus:border-primary outline-none transition-all duration-300 ease-in-out
            ${
              selectedCommunity === "draft"
                ? "bg-primary text-white"
                : "bg-neutral-200 text-neutral-600"
            }
          `}
        >
          Save as Draft
        </button>

        {/* Specific Community Pill */}
        {selectedCommunity && typeof selectedCommunity !== "string" && (
          <div
            className="group flex-grow lg:flex-none flex justify-between items-center px-2 py-1 bg-sky-100 text-sky-600 rounded-full transition-all duration-200 ease-in-out"
            style={{
              backgroundColor: "#0070f320",
              color: "#0070f3",
            }}
            title={getSelectedCommunityName()}
          >
            {getSelectedCommunityName()}
            <div
              className={`ml-2 lg:ml-0 group-hover:ml-2 flex items-center justify-center lg:max-w-0 group-hover:max-w-96 overflow-hidden transition-all duration-200 ease-in-out`}
            >
              |
              <button
                onClick={() => onChange("public")}
                className="ml-2 hover:scale-125 rounded-full transition-all duration-200 ease-in-out"
              >
                <IconTrash size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Select Community Button */}
        {communities.length > 0 &&
          (selectedCommunity === "public" || selectedCommunity === "draft") &&
          !isSearchMode && (
            <button
              onClick={() => setIsSearchMode(true)}
              className="
              px-3 py-1 rounded-full border focus:border-primary outline-none 
              bg-neutral-200 text-neutral-600 hover:bg-neutral-300 
              transition-all duration-200 ease-in-out
            "
            >
              Select a Community
            </button>
          )}
      </div>

      {/* Community Search Input (when in search mode) */}
      {isSearchMode && (
        <div className="flex items-center gap-2">
          <div className="flex-grow relative">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Search communities..."
              autoFocus
              className="w-[150px] max-h-8 border border-300 focus:border-primary outline-none rounded px-2 py-1 transition-all duration-200 ease-in-out"
            />

            {/* Autocomplete Dropdown */}
            {filteredCommunities.length > 0 && (
              <ul className="absolute z-10 bg-white border rounded shadow-lg w-full mt-1">
                {filteredCommunities.map((community, index) => (
                  <li
                    key={community.id}
                    onClick={() => handleCommunitySelect(community)}
                    className={`
                      px-2 py-1 cursor-pointer 
                      ${
                        index === highlightedIndex
                          ? "bg-primary/10 font-semibold"
                          : "hover:bg-gray-100"
                      }
                    `}
                  >
                    {community.display_name || community.name}
                    {index === highlightedIndex && (
                      <span className="text-xs text-gray-500 ml-2">
                        (Press Enter ↵)
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
