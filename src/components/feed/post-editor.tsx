import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateHtmlFromNodes } from "@lexical/html";

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";

// Import basic markdown transformers
import {
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  INLINE_CODE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
} from "@lexical/markdown";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";

// Import only the node types we need for basic formatting
import { TextNode } from "lexical";
import { CodeNode } from "@lexical/code";

// Define the basic transformers we want to support
const BASIC_TRANSFORMERS = [
  BOLD_STAR,
  BOLD_UNDERSCORE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  INLINE_CODE,
];

interface EditorContentPluginProps {
  onChange: (text: string) => void;
}

function OnChangePlugin({
  onChange,
}: EditorContentPluginProps): React.ReactNode {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(async () => {
        // Get both plain text (for empty check) and HTML content
        const rootNode = editor.getEditorState()._nodeMap.get("root");
        const plainText = rootNode ? rootNode.getTextContent() : "";

        // Generate HTML from the editor content
        const htmlContent = $generateHtmlFromNodes(editor);

        // Send HTML content to parent component
        onChange(plainText.trim() === "" ? "" : htmlContent);
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
  // Lexical Editor with simplified theme
  const initialTheme = {
    text: {
      bold: `font-bold`,
      italic: `font-italic`,
      code: `font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded`,
    },
  };

  const initialConfig = {
    namespace: "post",
    theme: initialTheme,
    onError: (error: Error) => {
      console.error("Lexical Editor Error:", error);
    },
    nodes: [
      TextNode,
      CodeNode, // Needed for inline code
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
        <MarkdownShortcutPlugin transformers={BASIC_TRANSFORMERS} />
        <OnChangePlugin onChange={onChange} />
      </LexicalComposer>
    </div>
  );
}
