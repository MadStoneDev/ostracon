import {
  AutoLinkPlugin,
  createLinkMatcherWithRegExp,
} from "@lexical/react/LexicalAutoLinkPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
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

export default function PostEditor() {
  // Lexical Editor
  const initialTheme = {
    text: {
      bold: `font-bold`,
      italic: `font-italic`,
      strikethrough: `line-through`,
    },
    heading: {
      h1: `text-2xl`,
      h2: `text-xl`,
      h3: `text-lg`,
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

  const MATCHERS = [
    createLinkMatcherWithRegExp(URL_REGEX, (text) => {
      return text;
    }),
    createLinkMatcherWithRegExp(EMAIL_REGEX, (text) => {
      return `mailto:${text}`;
    }),
  ];

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
    <LexicalComposer initialConfig={initialConfig}>
      <AutoFocusPlugin />
      {/*<AutoLinkPlugin matchers={MATCHERS} />*/}
      {/*<LinkPlugin />*/}
      <RichTextPlugin
        contentEditable={
          <ContentEditable className={`pr-4 h-full focus:outline-none`} />
        }
        placeholder={<div className={`absolute`}>Start typing here...</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      {/*<HashtagPlugin />*/}
      <HistoryPlugin />
      <MarkdownShortcutPlugin transformers={MY_TRANSFORMERS} />
    </LexicalComposer>
  );
}
