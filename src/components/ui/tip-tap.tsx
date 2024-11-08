"use client";

import { useEditor, EditorContent } from "@tiptap/react";

import { StarterKit } from "@tiptap/starter-kit";
import Emoji from "@tiptap/extension-emoji";
import { emojis, gitHubEmojis } from "@tiptap-pro/extension-emoji";

export default function TipTap({ content }: { content: string }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Emoji.configure({
        enableEmoticons: true,
        suggestion: {
          items: ({ query }: { query: string }) => {
            return emojis.filter((emoji) => {
              emoji.name.toLowerCase().includes(query.toLowerCase()) ||
                emoji.keywords
                  .some((keyword: string) =>
                    keyword.toLowerCase().includes(query.toLowerCase()),
                  )
                  .slice(0, 10);
            });
          },
        },
      }),
    ],
    content: content,
  });

  if (!editor) return null;

  return <EditorContent editor={editor} />;
}
