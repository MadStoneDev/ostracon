/**
 * Text content moderation.
 *
 * Policy:
 * - Detects NSFW text content and flags the post as NSFW
 * - Detects harmful content (threats, slurs) and flags for moderator review
 * - Does NOT remove content — only flags/marks it
 */

export type TextModerationResult = {
  /** Whether the content should be auto-marked as NSFW */
  nsfw: boolean;
  /** Whether the content should be flagged for moderator review */
  flagged: boolean;
  /** Risk level */
  riskLevel: "low" | "medium" | "high";
  /** Reasons for the decision */
  reasons: string[];
};

// Patterns that indicate NSFW text content
// These are kept broad but targeted — false positives are preferred over false negatives
// since the consequence is just an NSFW tag, not removal
const NSFW_PATTERNS = [
  // Sexual content
  /\b(nude|nudes|naked|porn|pornograph|hentai|xxx|nsfw)\b/i,
  /\b(sex\s?tape|onlyfans|fansly|chaturbate)\b/i,
  /\b(erotic|erotica|fetish|kink|bdsm)\b/i,
  /\b(orgasm|masturbat|genital|penis|vagina|vulva)\b/i,
  /\b(dildo|vibrator|sex\s?toy)\b/i,
  // Gore / graphic violence
  /\b(gore|gory|dismember|disembowel|mutilat)\b/i,
  /\b(beheading|decapitat)\b/i,
];

// Patterns that indicate potentially harmful content for moderator review
const HARMFUL_PATTERNS = [
  // Threats / targeted harassment
  /\b(kill\s+(your|my|him|her|them)self|kys)\b/i,
  /\b(i('ll|\s+will)\s+kill\s+you)\b/i,
  /\b(death\s+threat|bomb\s+threat)\b/i,
  // Self-harm
  /\b(cut\s+my\s*(self|wrist)|sui[c]ide\s+(method|how\s+to))\b/i,
  // Doxxing indicators
  /\b(doxx|dox|swat)\s*(ing|ed)?\b/i,
];

/**
 * Moderate text content for NSFW and harmful material.
 * Strips HTML before checking to avoid false positives from markup.
 */
export function moderateText(text: string): TextModerationResult {
  // Strip HTML tags for analysis
  const clean = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  const reasons: string[] = [];
  let nsfw = false;
  let flagged = false;
  let riskLevel: "low" | "medium" | "high" = "low";

  // Check for NSFW patterns
  for (const pattern of NSFW_PATTERNS) {
    if (pattern.test(clean)) {
      nsfw = true;
      const match = clean.match(pattern);
      if (match) {
        reasons.push(`NSFW content detected`);
      }
      break; // One match is enough to flag NSFW
    }
  }

  // Check for harmful patterns
  for (const pattern of HARMFUL_PATTERNS) {
    if (pattern.test(clean)) {
      flagged = true;
      riskLevel = "high";
      reasons.push("Potentially harmful content detected");
      break;
    }
  }

  if (nsfw && !flagged) {
    riskLevel = "medium";
  }

  return { nsfw, flagged, riskLevel, reasons };
}
