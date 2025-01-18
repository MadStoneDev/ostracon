import { ContentSegment } from "@/types/fragments";

export function processContent(content: string): ContentSegment[] {
  // This regex matches:
  // 1. @mentions can include word chars, dots, and dashes
  // 2. #hashtags that are word characters or dashes
  // 3. Any other text between them
  const regex = /(@[\w.-]+)|(#[\w-]+)|([^@#]+)/g;
  const matches = content.matchAll(regex);
  const segments: ContentSegment[] = [];

  for (const match of matches) {
    const [fullMatch, mention, hashtag, text] = match;

    if (mention) {
      // Process @mention
      const username = mention.slice(1); // Remove @
      segments.push({
        type: "mention",
        content: mention,
        url: `/profile/${username}`,
      });
    } else if (hashtag) {
      // Process #hashtag
      const tag = hashtag.slice(1); // Remove #
      segments.push({
        type: "hashtag",
        content: hashtag,
        url: `/explore/search/tag/${tag}`,
      });
    } else if (text) {
      // Process regular text
      segments.push({
        type: "text",
        content: text,
      });
    }
  }

  return segments;
}

export function formatTimestamp(timestamp: string): {
  label: string;
  tooltip: string;
} {
  const date: Date = new Date(timestamp);
  const now: Date = new Date();
  const diff = now.getTime() - date.getTime(); // difference in milliseconds

  // Convert to seconds
  const secondsAgo = Math.floor(diff / 1000);

  // Less than 1 minute
  if (secondsAgo < 60) {
    return {
      label: `${secondsAgo}s`,
      tooltip: "Just now",
    };
  }

  // Convert to minutes
  const minutesAgo = Math.floor(secondsAgo / 60);

  // Less than 1 hour
  if (minutesAgo < 60) {
    return {
      label: `${minutesAgo}m`,
      tooltip: `Posted ${minutesAgo} minute${minutesAgo === 1 ? "" : "s"} ago`,
    };
  }

  // Convert to hours
  const hoursAgo = Math.floor(minutesAgo / 60);

  // Less than 24 hours
  if (hoursAgo < 24) {
    return {
      label: `${hoursAgo}h`,
      tooltip: `Posted ${hoursAgo} hour${hoursAgo === 1 ? "" : "s"} ago`,
    };
  }

  // Convert to days
  const daysAgo = Math.floor(hoursAgo / 24);

  // Less than 3 days
  if (daysAgo < 7) {
    return {
      label: `${daysAgo}d`,
      tooltip: `Posted ${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`,
    };
  }

  // Format the date
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = date.getDate().toString().padStart(2, "0");
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  // Within this year
  if (date.getFullYear() === now.getFullYear()) {
    return {
      label: `${day} ${month}`,
      tooltip: `Posted ${day} ${month} ${year}`,
    };
  }

  // Otherwise include the year
  return {
    label: `${day} ${month} ${year}`,
    tooltip: `Posted ${day} ${month} ${year}`,
  };
}
