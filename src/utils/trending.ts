/**
 * Trending score calculation.
 * Score = (reactions * 3 + comments * 5) / (hours_since_published ^ 1.5)
 * Time-decay weighted: newer posts with engagement rank higher.
 */
export function calculateTrendingScore(
  reactionCount: number,
  commentCount: number,
  publishedAt: string,
): number {
  const hoursSincePublished = Math.max(
    1,
    (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60),
  );

  const engagement = reactionCount * 3 + commentCount * 5;
  return engagement / Math.pow(hoursSincePublished, 1.5);
}
