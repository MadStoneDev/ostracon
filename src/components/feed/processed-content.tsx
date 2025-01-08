import { useState } from "react";
import { ContentSegment } from "@/types/fragments";
import Link from "next/link";

interface ProcessedContentProps {
  postId: string;
  content: ContentSegment[];
  truncate?: boolean;
  wordLimit?: number;
  showExpandButton?: boolean;
}

export default function ProcessedContent({
  postId,
  content,
  truncate = false,
  wordLimit = 50,
  showExpandButton = false,
}: ProcessedContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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

  return (
    <div>
      {processedSegments.map((segment, index) => {
        if (segment.type === "text") {
          return <span key={index}>{segment.content}</span>;
        }

        return (
          <a
            key={index}
            href={segment.url}
            className="text-primary hover:text-primary/65 font-bold transition-all duration-300 ease-in-out"
          >
            {segment.content}
          </a>
        );
      })}

      {truncate && showExpandButton && wasTruncated && (
        <div>
          <Link
            href={`/post/${postId}}`}
            className={`mt-5 block text-primary hover:text-primary/65 text-sm font-bold transition-all duration-300 ease-in-out`}
          >
            Read more
          </Link>
        </div>
      )}
    </div>
  );
}
