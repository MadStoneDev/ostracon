"use client";

import { useState } from "react";
import { IconTrash, IconX } from "@tabler/icons-react";
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
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.length >= 1) {
      const suggestions = availableTags.filter(
        (tag) =>
          tag.tag.toLowerCase().includes(value.toLowerCase()) &&
          !selectedTags.some((selectedTag) => selectedTag.id === tag.id),
      );
      setSuggestedTags(suggestions);
      setHighlightedIndex(0); // Reset highlighted index when suggestions change
    } else {
      setSuggestedTags([]);
      setHighlightedIndex(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (selectedTags.length >= maxTags) {
      e.preventDefault();
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          Math.min(prev + 1, suggestedTags.length - 1),
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
        break;

      case "Enter":
      case ",":
        e.preventDefault();
        if (suggestedTags.length > 0) {
          const selectedTag = suggestedTags[highlightedIndex];
          onTagAdd(selectedTag);
          setInputValue("");
          setSuggestedTags([]);
          setHighlightedIndex(0);
        }
        break;
    }
  };

  return (
    <div className="flex flex-wrap gap-2 items-center text-sm">
      {selectedTags.map((tag) => (
        <div
          key={tag.id}
          className="group flex-grow lg:flex-none flex justify-between items-center px-2 py-1 rounded-full transition-all duration-200 ease-in-out"
          style={{
            backgroundColor: (tag.colour || "#000") + "20",
            color: tag.colour || "#000",
          }}
          title={tag.tag} // Show full tag name on hover
        >
          {tag.tag}
          <div
            className={`ml-2 lg:ml-0 group-hover:ml-2 flex items-center justify-center lg:max-w-0 group-hover:max-w-96 overflow-hidden transition-all duration-200 ease-in-out`}
          >
            |
            <button
              onClick={() => onTagRemove(tag.id)}
              className="ml-2 hover:scale-125 rounded-full transition-all duration-200 ease-in-out"
            >
              <IconTrash size={16} />
            </button>
          </div>
        </div>
      ))}

      {selectedTags.length < maxTags && (
        <div className="flex-grow relative">
          <input
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Add tags (${selectedTags.length}/${maxTags})`}
            className="w-full border focus:border-primary outline-none rounded px-2 py-1 transition-all duration-300 ease-in-out"
          />

          {suggestedTags.length > 0 && (
            <ul className="absolute z-10 bg-white border rounded shadow-lg">
              {suggestedTags.length > 0 && (
                <ul className="absolute z-10 w-max bg-white border rounded shadow-lg">
                  {suggestedTags.map((tag, index) => (
                    <li
                      key={tag.id}
                      onClick={() => {
                        onTagAdd(tag);
                        setInputValue("");
                        setSuggestedTags([]);
                        setHighlightedIndex(0);
                      }}
                      className={`px-2 py-1 cursor-pointer flex items-center justify-between ${
                        index === highlightedIndex
                          ? "bg-primary/10 font-semibold"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <span>{tag.tag}</span>
                      {index === highlightedIndex && (
                        <span className="min text-xs text-gray-500 ml-2">
                          (Press Enter ↵)
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default TagSelector;
