// This stays as a server component
import ExploreFeed from "@/components/feed/explore-feed";

export const metadata = {
  title: "Explore | Ostracon",
  description:
    "Discover posts from people you follow and communities you're part of",
};

export default function Explore() {
  return <ExploreFeed />;
}
