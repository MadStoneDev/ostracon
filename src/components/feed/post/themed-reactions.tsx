"use client";

type EmojiReaction = {
  emoji: string;
  label: string;
  type: string;
};

type ThemedReactionsProps = {
  emojiSet: EmojiReaction[];
  /** Which reaction types the current user has used */
  userReactions: Set<string>;
  /** Count per reaction type */
  reactionCounts: Record<string, number>;
  /** Called when user clicks a reaction */
  onReact: (type: string) => void;
  disabled?: boolean;
  themeColor?: string | null;
};

export default function ThemedReactions({
  emojiSet,
  userReactions,
  reactionCounts,
  onReact,
  disabled = false,
  themeColor,
}: ThemedReactionsProps) {
  return (
    <div className="flex gap-1.5">
      {emojiSet.map((reaction) => {
        const isActive = userReactions.has(reaction.type);
        const count = reactionCounts[reaction.type] || 0;

        return (
          <button
            key={reaction.type}
            onClick={() => onReact(reaction.type)}
            disabled={disabled}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-all ${
              isActive
                ? "bg-primary/15 border border-primary/30"
                : "bg-gray-100 dark:bg-gray-800 border border-transparent hover:border-gray-300 dark:hover:border-gray-600"
            } disabled:opacity-50`}
            style={
              isActive && themeColor
                ? { backgroundColor: `${themeColor}15`, borderColor: `${themeColor}50` }
                : undefined
            }
            title={reaction.label}
            aria-label={`${reaction.label} (${count})`}
          >
            <span className="text-base">{reaction.emoji}</span>
            {count > 0 && (
              <span className="text-xs font-medium">{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
