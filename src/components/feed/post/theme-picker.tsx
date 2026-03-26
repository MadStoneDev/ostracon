"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";

type Theme = {
  id: string;
  name: string;
  display_name: string;
  emoji_set: { emoji: string; label: string; type: string }[];
  color: string | null;
};

type ThemePickerProps = {
  selectedThemeId: string | null;
  onSelect: (themeId: string | null) => void;
};

export default function ThemePicker({
  selectedThemeId,
  onSelect,
}: ThemePickerProps) {
  const supabase = useMemo(() => createClient(), []);
  const [themes, setThemes] = useState<Theme[]>([]);

  useEffect(() => {
    const fetchThemes = async () => {
      const { data } = await supabase
        .from("post_themes")
        .select("id, name, display_name, emoji_set, color")
        .eq("is_active", true)
        .order("display_order");

      if (data) setThemes(data as Theme[]);
    };
    fetchThemes();
  }, [supabase]);

  if (themes.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {themes.map((theme) => {
        const isSelected = selectedThemeId === theme.id;
        const emojis = theme.emoji_set.map((e) => e.emoji).join(" ");

        return (
          <button
            key={theme.id}
            type="button"
            onClick={() => onSelect(isSelected ? null : theme.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              isSelected
                ? "border-primary bg-primary/10 text-primary"
                : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
            }`}
            style={
              isSelected && theme.color
                ? { borderColor: theme.color, color: theme.color, backgroundColor: `${theme.color}15` }
                : undefined
            }
          >
            {emojis} {theme.display_name}
          </button>
        );
      })}
    </div>
  );
}
