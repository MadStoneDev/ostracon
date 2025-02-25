import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $convertToMarkdownString, TRANSFORMERS } from "@lexical/markdown";

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";

import {
  BOLD_STAR,
  CODE,
  CHECK_LIST,
  HEADING,
  INLINE_CODE,
  ITALIC_STAR,
  STRIKETHROUGH,
} from "@lexical/markdown";

import { CodeNode } from "@lexical/code";
import { HashtagNode } from "@lexical/hashtag";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListNode, ListItemNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";

interface EditorContentPluginProps {
  onChange: (text: string) => void;
}

function OnChangePlugin({
  onChange,
}: EditorContentPluginProps): React.ReactNode {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        // Get plain text for checking if editor is empty
        const root = editor.getEditorState()._nodeMap.get("root");
        const plainText = root ? root.getTextContent() : "";

        if (plainText.trim().length === 0) {
          onChange("");
          return;
        }

        // This must be called within the read() callback
        const markdown = $convertToMarkdownString(TRANSFORMERS);
        onChange(markdown);
      });
    });
  }, [editor, onChange]);

  return null;
}

interface PostEditorProps {
  onChange?: (text: string) => void;
}

export default function PostEditor({
  onChange = () => {},
}: PostEditorProps): React.ReactNode {
  // Lexical Editor
  const initialTheme = {
    text: {
      bold: `font-bold`,
      italic: `font-italic`,
      strikethrough: `line-through`,
    },
    heading: {
      h1: `text-3xl font-bold`,
      h2: `text-2xl font-bold`,
      h3: `text-lg font-bold`,
    },
    link: `text-primary font-bold`,
    autolink: `text-primary font-bold`,
  };

  const MY_TRANSFORMERS = [
    BOLD_STAR,
    CHECK_LIST,
    CODE,
    HEADING,
    INLINE_CODE,
    ITALIC_STAR,
    STRIKETHROUGH,
  ];

  const URL_REGEX =
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;

  const EMAIL_REGEX =
    /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;

  const initialConfig = {
    namespace: "post",
    theme: initialTheme,
    onError: console.error,
    nodes: [
      AutoLinkNode,
      CodeNode,
      HashtagNode,
      HeadingNode,
      LinkNode,
      ListNode,
      ListItemNode,
      QuoteNode,
    ],
  };

  return (
    <div className={`relative w-full h-full`}>
      <LexicalComposer initialConfig={initialConfig}>
        <AutoFocusPlugin />
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className={`flex-grow pr-4 w-full min-h-full focus:outline-none`}
            />
          }
          placeholder={
            <div className={`absolute top-0 pointer-events-none opacity-50`}>
              Start typing here...
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <MarkdownShortcutPlugin transformers={MY_TRANSFORMERS} />
        <OnChangePlugin onChange={onChange} />
      </LexicalComposer>
    </div>
  );
}
