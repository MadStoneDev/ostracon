// utils/moderation.ts
import { createClient } from "@/utils/supabase/client";

export type UserPermissions = {
  isModerator: boolean;
  isAdmin: boolean;
  canModerate: boolean;
  canManageUsers: boolean;
};

export async function getUserPermissions(
  userId: string,
): Promise<UserPermissions> {
  const supabase = createClient();

  const { data: user, error } = await supabase
    .from("users")
    .select("is_moderator, is_admin")
    .eq("id", userId)
    .single();

  if (error || !user) {
    return {
      isModerator: false,
      isAdmin: false,
      canModerate: false,
      canManageUsers: false,
    };
  }

  return {
    isModerator: user.is_moderator || false,
    isAdmin: user.is_admin || false,
    canModerate: user.is_moderator || user.is_admin || false,
    canManageUsers: user.is_admin || false,
  };
}

export type SightEngineViolation = {
  hasViolations: boolean;
  reason: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  specificViolations: string[];
};

export const updateRiskLevel = (
  newLevel: "low" | "medium" | "high" | "critical",
  riskLevel: "low" | "medium" | "high" | "critical",
) => {
  const levels = { low: 1, medium: 2, high: 3, critical: 4 };
  if (levels[newLevel] > levels[riskLevel]) {
    return newLevel;
  } else {
    return riskLevel;
  }
};

export function analyseSightEngineResult(result: any): SightEngineViolation {
  const violations: string[] = [];
  let riskLevel: "low" | "medium" | "high" | "critical" = "low";

  // Check nudity violations
  if (result.nudity) {
    if (
      result.nudity.sexual_activity > 0.8 ||
      result.nudity.sexual_display > 0.8
    ) {
      violations.push("Explicit sexual content");
      riskLevel = "critical";
    } else if (
      result.nudity.erotica > 0.6 ||
      result.nudity.very_suggestive > 0.6
    ) {
      violations.push("Highly suggestive content");
      riskLevel = updateRiskLevel("high", riskLevel);
    } else if (
      result.nudity.suggestive > 0.6 ||
      result.nudity.mildly_suggestive > 0.7
    ) {
      violations.push("Suggestive content");
      riskLevel = riskLevel === "low" ? "medium" : riskLevel;
    }
  }

  // Check weapon violations
  if (result.weapon && result.weapon > 0.6) {
    violations.push("Weapon detected");
    riskLevel = riskLevel === "critical" ? "critical" : "high";
  }

  // Check drug violations
  if (result.recreational_drug?.prob && result.recreational_drug.prob > 0.6) {
    violations.push("Drug-related content");
    riskLevel = riskLevel === "low" ? "medium" : riskLevel;
  }

  // Check gore violations
  if (result.gore?.prob && result.gore.prob > 0.6) {
    violations.push("Gore/violent content");
    riskLevel = "critical";
  }

  // Check self-harm violations
  if (result["self-harm"]?.prob && result["self-harm"].prob > 0.6) {
    violations.push("Self-harm content");
    riskLevel = "critical";
  }

  // Check violence violations
  if (result.violence && result.violence > 0.6) {
    violations.push("Violent content");
    riskLevel = riskLevel === "critical" ? "critical" : "high";
  }

  // Check medical violations (lower threshold for medical content)
  if (result.medical?.prob && result.medical.prob > 0.5) {
    violations.push("Medical/pharmaceutical content");
    riskLevel = riskLevel === "low" ? "medium" : riskLevel;
  }

  return {
    hasViolations: violations.length > 0,
    reason: violations.join(", "),
    riskLevel,
    specificViolations: violations,
  };
}
