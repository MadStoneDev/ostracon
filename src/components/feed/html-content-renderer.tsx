import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import DOMPurify from "dompurify";

interface HtmlContentProps {
  postId: string;
  content: string;
  truncate?: boolean;
  isExpanded?: boolean;
  maxLines?: number;
  showExpandButton?: boolean;
}

export default function HtmlContent({
  postId,
  content,
  truncate = true,
  isExpanded = false,
  maxLines = 8,
  showExpandButton = true,
}: HtmlContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    // Check if content needs truncation
    if (truncate && !isExpanded && contentRef.current) {
      const contentElement = contentRef.current;
      const lineHeight = parseInt(
        getComputedStyle(contentElement).lineHeight || "24",
      );
      const maxHeight = lineHeight * maxLines;

      // Set truncated state if content is taller than maxHeight
      if (contentElement.scrollHeight > maxHeight) {
        setIsTruncated(true);
      } else {
        setIsTruncated(false);
      }
    } else {
      setIsTruncated(false);
    }
  }, [content, truncate, isExpanded, maxLines]);

  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      "p", "strong", "em", "code", "br", "a", "ul", "ol", "li",
      "h1", "h2", "h3", "h4", "h5", "h6", "span", "pre", "blockquote",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class", "style"],
  });

  return (
    <div className="html-content-container">
      <div
        ref={contentRef}
        className="text-dark dark:text-light whitespace-pre-wrap break-words"
        style={{
          maxHeight: truncate && !isExpanded ? `${maxLines * 1.5}em` : "none",
          overflow: truncate && !isExpanded ? "hidden" : "visible",
        }}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />

      {isTruncated && !isExpanded && showExpandButton && (
        <div className="relative">
          <div className="absolute -top-10 left-0 right-0 h-10 bg-gradient-to-t from-light dark:from-dark to-transparent" />
          <div className="flex justify-center mt-2">
            <Link
              href={`/post/${postId}`}
              className="px-3 py-1 bg-light/80 dark:bg-dark/80 text-dark dark:text-light rounded-full text-xs font-bold hover:bg-primary hover:text-light transition-all duration-300 ease-in-out"
            >
              Read more
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
