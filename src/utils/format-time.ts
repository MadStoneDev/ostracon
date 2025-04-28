export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Less than a minute
  if (diffInSeconds < 60) {
    return "just now";
  }

  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  }

  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }

  // Less than a week
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }

  // More than a week - show the date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatMessageTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDateForGrouping(date: Date): string {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === now.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
    // Less than a week ago - show the day name
    return date.toLocaleDateString("en-US", { weekday: "long" });
  } else {
    // More than a week ago - show the date
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: now.getFullYear() !== date.getFullYear() ? "numeric" : undefined,
    });
  }
}
