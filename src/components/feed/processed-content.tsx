import Link from "next/link";
import React from "react";
import { ContentSegment } from "@/types/fragments";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ProcessedContentProps {
  postId: string;
  content: ContentSegment[];
  truncate?: boolean;
  isExpanded?: boolean;
  wordLimit?: number;
  showExpandButton?: boolean;
}

export default function ProcessedContent({
  postId,
  content,
  truncate = false,
  isExpanded = false,
  showExpandButton = true,
  wordLimit = 50,
}: ProcessedContentProps) {
  const processSegmentsWithTruncation = (segments: ContentSegment[]) => {
    if (!truncate || isExpanded) return { segments, wasTruncated: false };

    let wordCount = 0;
    const truncatedSegments: ContentSegment[] = [];
    let wasTruncated = false;

    for (const segment of segments) {
      const words = segment.content.split(/\s+/);
      const remainingWords = wordLimit - wordCount;

      if (wordCount >= wordLimit) {
        wasTruncated = true;
        break;
      }

      if (words.length + wordCount <= wordLimit) {
        // Add entire segment
        truncatedSegments.push(segment);
        wordCount += words.length;
      } else {
        // Add partial segment
        const truncatedContent = words.slice(0, remainingWords).join(" ");
        truncatedSegments.push({
          ...segment,
          content: truncatedContent + "...",
        });
        wasTruncated = true;
        break;
      }
    }

    return { segments: truncatedSegments, wasTruncated };
  };

  const { segments: processedSegments, wasTruncated } =
    processSegmentsWithTruncation(content);

  // Function to render different segment types
  const renderSegment = (segment: ContentSegment, index: number) => {
    if (segment.type === "text") {
      return (
        <ReactMarkdown
          key={index}
          remarkPlugins={[remarkGfm]}
          components={{
            // Make sure links don't override our styles
            a: ({ node, ...props }) => (
              <a
                {...props}
                className="text-primary hover:text-primary/65 font-bold transition-all duration-300 ease-in-out"
              />
            ),
          }}
        >
          {segment.content}
        </ReactMarkdown>
      );
    } else if (segment.type === "mention") {
      return (
        <Link
          key={index}
          href={segment.url || ""}
          className={`py-0.5 px-1 bg-primary rounded-md text-light dark:text-dark hover:opacity-65 font-bold transition-all duration-300 ease-in-out`}
        >
          {segment.content}
        </Link>
      );
    } else if (segment.type === "hashtag") {
      return (
        <Link
          key={index}
          href={segment.url || ""}
          className="text-primary hover:text-primary/65 font-bold transition-all duration-300 ease-in-out"
        >
          {segment.content}
        </Link>
      );
    }

    // Default case for URLs or other types
    return (
      <a
        key={index}
        href={segment.url}
        className="text-primary hover:text-primary/65 font-bold transition-all duration-300 ease-in-out"
      >
        {segment.content}
      </a>
    );
  };

  return (
    <div
      className={`${
        truncate && !isExpanded
          ? "max-h-[300px] overflow-y-hidden relative"
          : ""
      }`}
    >
      <div>{processedSegments.map(renderSegment)}</div>

      {truncate && wasTruncated && !isExpanded && (
        <div
          className={`absolute bottom-0 left-0 right-0 pt-16 pb-2 bg-gradient-to-t from-light dark:from-dark to-transparent flex justify-center items-end`}
        >
          {showExpandButton && (
            <Link
              href={`/post/${postId}`}
              className={`px-3 py-1 bg-light/80 dark:bg-dark/80 text-dark dark:text-light rounded-full text-xs font-bold hover:bg-primary hover:text-light transition-all duration-300 ease-in-out`}
            >
              Read more
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
