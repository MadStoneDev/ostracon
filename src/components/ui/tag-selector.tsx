"use client";

import { useState } from "react";
import { IconX } from "@tabler/icons-react";
import type { Database } from "../../../database.types";

type Tag = Database["public"]["Tables"]["tags"]["Row"];

const TagSelector = ({
  availableTags,
  selectedTags,
  onTagAdd,
  onTagRemove,
  maxTags = 5, // Optional max tags
}: {
  availableTags: Tag[];
  selectedTags: Tag[];
  onTagAdd: (tag: Tag) => void;
  onTagRemove: (tagId: string) => void;
  maxTags?: number;
}) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestedTags, setSuggestedTags] = useState<Tag[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Suggest tags after 2 characters
    if (value.length >= 2) {
      const suggestions = availableTags.filter(
        (tag) =>
          tag.tag.toLowerCase().includes(value.toLowerCase()) &&
          !selectedTags.some((selectedTag) => selectedTag.id === tag.id),
      );
      setSuggestedTags(suggestions);
    } else {
      setSuggestedTags([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent adding more tags than max limit
    if (selectedTags.length >= maxTags) {
      e.preventDefault();
      return;
    }

    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();

      // If exact match exists and not already selected
      const exactMatch = suggestedTags.find(
        (tag) => tag.tag.toLowerCase() === inputValue.toLowerCase(),
      );

      if (exactMatch) {
        onTagAdd(exactMatch);
        setInputValue("");
        setSuggestedTags([]);
      }
    }
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {selectedTags.map((tag) => (
        <div
          key={tag.id}
          className="flex items-center gap-2 px-2 py-1 rounded-full"
          style={{
            backgroundColor: (tag.colour || "#000") + "20",
            color: tag.colour || "#000",
          }}
          title={tag.tag} // Show full tag name on hover
        >
          {tag.tag}
          <button
            onClick={() => onTagRemove(tag.id)}
            className="ml-2 hover:bg-red-100 rounded-full"
          >
            <IconX size={16} />
          </button>
        </div>
      ))}

      {selectedTags.length < maxTags && (
        <div className="relative">
          <input
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Add tags (${selectedTags.length}/${maxTags})`}
            className="border rounded px-2 py-1"
          />

          {suggestedTags.length > 0 && (
            <ul className="absolute z-10 bg-white border rounded shadow-lg">
              {suggestedTags.map((tag) => (
                <li
                  key={tag.id}
                  onClick={() => {
                    onTagAdd(tag);
                    setInputValue("");
                    setSuggestedTags([]);
                  }}
                  className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                >
                  {tag.tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
