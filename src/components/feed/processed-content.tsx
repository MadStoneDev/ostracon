import { ContentSegment } from "@/types/fragments";

export default function ProcessedContent({
  content,
}: {
  content: ContentSegment[];
}) {
  return (
    <>
      {content.map((segment, index) => {
        if (segment.type === "text") {
          return <span key={index}>{segment.content}</span>;
        }

        return (
          <a
            key={index}
            href={segment.url}
            className={`text-primary hover:text-primary/65 font-bold transition-all duration-300 ease-in-out`}
          >
            {segment.content}
          </a>
        );
      })}
    </>
  );
}
