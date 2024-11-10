"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";

export default function TipTap({
  content,
  onChange,
}: {
  content: string;
  onChange: (content: string) => void;
}) {
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
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
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
