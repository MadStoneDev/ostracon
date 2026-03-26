"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { IconSearch, IconX } from "@tabler/icons-react";

type GifResult = {
  id: string;
  url: string;
  preview: string;
  width: number;
  height: number;
};

type GifPickerProps = {
  onSelect: (gifUrl: string) => void;
  onClose: () => void;
};

export default function GifPicker({ onSelect, onClose }: GifPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GifResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchGifs = useCallback(async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_TENOR_API_KEY || "AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ"; // Tenor default test key
      const endpoint = searchQuery
        ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(searchQuery)}&key=${apiKey}&limit=20&media_filter=gif,tinygif`
        : `https://tenor.googleapis.com/v2/featured?key=${apiKey}&limit=20&media_filter=gif,tinygif`;

      const response = await fetch(endpoint);
      const data = await response.json();

      const gifs: GifResult[] = (data.results || []).map((item: any) => ({
        id: item.id,
        url: item.media_formats?.gif?.url || item.media_formats?.tinygif?.url || "",
        preview: item.media_formats?.tinygif?.url || item.media_formats?.gif?.url || "",
        width: item.media_formats?.tinygif?.dims?.[0] || 200,
        height: item.media_formats?.tinygif?.dims?.[1] || 200,
      }));

      setResults(gifs);
    } catch (error) {
      console.error("Error searching GIFs:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load featured GIFs on mount
  useEffect(() => {
    searchGifs("");
  }, [searchGifs]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchGifs(query);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, searchGifs]);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 p-2 border-b border-gray-200 dark:border-gray-700">
        <IconSearch size={18} className="text-muted-foreground shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search GIFs..."
          className="flex-grow bg-transparent text-sm focus:outline-none"
          autoFocus
        />
        <button
          onClick={onClose}
          className="shrink-0 p-1 hover:text-primary transition-colors"
        >
          <IconX size={18} />
        </button>
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-3 gap-1 p-1 max-h-[250px] overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
            />
          ))
        ) : results.length === 0 ? (
          <p className="col-span-3 text-center text-sm text-muted-foreground py-4">
            No GIFs found
          </p>
        ) : (
          results.map((gif) => (
            <button
              key={gif.id}
              onClick={() => onSelect(gif.url)}
              className="relative aspect-square overflow-hidden rounded hover:ring-2 hover:ring-primary transition-all"
            >
              <Image
                src={gif.preview}
                alt="GIF"
                fill
                className="object-cover"
                unoptimized
              />
            </button>
          ))
        )}
      </div>

      {/* Tenor attribution */}
      <div className="p-1 text-center">
        <span className="text-[10px] text-muted-foreground">Powered by Tenor</span>
      </div>
    </div>
  );
}
