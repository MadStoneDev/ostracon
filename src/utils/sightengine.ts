/**
 * Server-side Sightengine image moderation.
 * API keys are kept server-side only — never exposed to the client.
 */

export type ImageModerationResult = {
  /** Whether the image should be blocked entirely (e.g., full nudity) */
  blocked: boolean;
  /** Whether the image should be flagged for moderator review */
  flagged: boolean;
  /** Whether the content is NSFW (bikini/underwear level) */
  nsfw: boolean;
  /** Risk level for the moderation queue */
  riskLevel: "low" | "medium" | "high" | "critical";
  /** Human-readable reasons */
  reasons: string[];
  /** Raw Sightengine response for audit trail */
  rawData: any;
};

/**
 * Check an image URL against Sightengine moderation.
 *
 * Policy:
 * - Full nudity / sexual content → BLOCKED
 * - Bikini / underwear / suggestive → allowed but flagged NSFW
 * - Violence, gore, self-harm → flagged for review
 * - Everything else → pass
 */
export async function moderateImage(
  imageUrl: string,
): Promise<ImageModerationResult> {
  const apiUser = process.env.SIGHTENGINE_API_USER;
  const apiSecret = process.env.SIGHTENGINE_API_SECRET;

  if (!apiUser || !apiSecret) {
    console.warn("Sightengine credentials not configured, skipping moderation");
    return {
      blocked: false,
      flagged: false,
      nsfw: false,
      riskLevel: "low",
      reasons: [],
      rawData: null,
    };
  }

  try {
    const params = new URLSearchParams({
      url: imageUrl,
      models: "nudity-2.1,gore-2.0,self-harm,violence,recreational_drug,weapon,medical",
      api_user: apiUser,
      api_secret: apiSecret,
    });

    const response = await fetch(
      `https://api.sightengine.com/1.0/check.json?${params.toString()}`,
    );

    if (!response.ok) {
      console.error("Sightengine API error:", response.status);
      return {
        blocked: false,
        flagged: false,
        nsfw: false,
        riskLevel: "low",
        reasons: [],
        rawData: null,
      };
    }

    const data = await response.json();
    return analyseImageResult(data);
  } catch (error) {
    console.error("Error calling Sightengine:", error);
    return {
      blocked: false,
      flagged: false,
      nsfw: false,
      riskLevel: "low",
      reasons: [],
      rawData: null,
    };
  }
}

function analyseImageResult(result: any): ImageModerationResult {
  const reasons: string[] = [];
  let blocked = false;
  let flagged = false;
  let nsfw = false;
  let riskLevel: "low" | "medium" | "high" | "critical" = "low";

  const bump = (level: "medium" | "high" | "critical") => {
    const order = { low: 0, medium: 1, high: 2, critical: 3 };
    if (order[level] > order[riskLevel]) riskLevel = level;
  };

  // --- Nudity checks ---
  if (result.nudity) {
    const n = result.nudity;

    // BLOCK: explicit nudity / sexual content
    if (n.sexual_activity > 0.7 || n.sexual_display > 0.7) {
      blocked = true;
      reasons.push("Explicit sexual content");
      bump("critical");
    }

    // BLOCK: full nudity (not swimwear)
    if (n.erotica > 0.7) {
      blocked = true;
      reasons.push("Nudity detected");
      bump("critical");
    }

    // FLAG but allow: very suggestive / underwear / bikini
    if (!blocked && (n.very_suggestive > 0.6 || n.suggestive > 0.7)) {
      nsfw = true;
      flagged = true;
      reasons.push("Suggestive content (swimwear/underwear)");
      bump("medium");
    }

    // Mild: just mark NSFW, no flag
    if (!blocked && !flagged && n.mildly_suggestive > 0.7) {
      nsfw = true;
      reasons.push("Mildly suggestive");
    }
  }

  // --- Violence / gore ---
  if (result.gore?.prob > 0.6) {
    flagged = true;
    reasons.push("Gore detected");
    bump("critical");
  }

  if (result.violence > 0.6) {
    flagged = true;
    reasons.push("Violence detected");
    bump("high");
  }

  // --- Self-harm ---
  if (result["self-harm"]?.prob > 0.6) {
    flagged = true;
    reasons.push("Self-harm content");
    bump("critical");
  }

  // --- Weapons ---
  if (result.weapon > 0.6) {
    flagged = true;
    reasons.push("Weapon detected");
    bump("high");
  }

  // --- Drugs ---
  if (result.recreational_drug?.prob > 0.6) {
    nsfw = true;
    flagged = true;
    reasons.push("Drug-related content");
    bump("medium");
  }

  return {
    blocked,
    flagged,
    nsfw,
    riskLevel,
    reasons,
    rawData: result,
  };
}
