"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

import Emoji from "@tiptap/extension-emoji";
import { emojis, gitHubEmojis } from "@tiptap-pro/extension-emoji";

export default function TipTap({ content }: { content: string }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
        code: false,
        codeBlock: false,
        hardBreak: false,
        strike: false,
        heading: false,
      }),
      Placeholder.configure({
        placeholder: "Start here...",
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      // onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-invert dark:prose-invert focus:outline-none flex-grow",
        // className,
      },
    },
  });

  if (!editor) return null;

  return (
    <EditorContent editor={editor} className={`flex-grow flex flex-col`} />
  );
}
