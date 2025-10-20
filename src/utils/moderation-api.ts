// utils/moderation-api.ts
import { createClient } from "@/utils/supabase/client";
import { analyseSightEngineResult } from "@/utils/moderation";

export class ModerationAPI {
  private supabase = createClient();

  async reportImage(
    imageUrl: string,
    uploadedBy: string,
    reportedBy: string | null,
    reason: string,
    sightengineData?: any,
  ) {
    const violation = sightengineData
      ? analyseSightEngineResult(sightengineData)
      : null;

    return this.supabase.from("images_moderation").insert({
      image_url: imageUrl,
      uploaded_by: uploadedBy,
      reported_by: reportedBy,
      reason: violation?.reason || reason,
      risk_level: violation?.riskLevel || "medium",
      sightengine_data: sightengineData,
    });
  }

  async reportPost(postId: string, reportedBy: string | null, reason: string) {
    return this.supabase.from("posts_moderation").insert({
      post_id: postId,
      reported_by: reportedBy,
      reason,
      risk_level: "medium",
    });
  }

  async reportProfile(
    reportedUserId: string,
    reportedBy: string,
    reason: string,
  ) {
    return this.supabase.from("profiles_moderation").insert({
      reported_user_id: reportedUserId,
      reported_by: reportedBy,
      reason,
      risk_level: "medium",
    });
  }

  async assignModerationItem(
    itemId: string,
    itemType: "image" | "post" | "profile",
    assigneeId: string | null,
  ) {
    const tableName =
      itemType === "image"
        ? "images_moderation"
        : itemType === "post"
          ? "posts_moderation"
          : "profiles_moderation";

    return this.supabase
      .from(tableName)
      .update({ assigned_to: assigneeId })
      .eq("id", itemId);
  }

  async resolveModerationItem(
    itemId: string,
    itemType: "image" | "post" | "profile",
    status: "approved" | "rejected",
    resolvedBy: string,
    notes?: string,
  ) {
    const tableName =
      itemType === "image"
        ? "images_moderation"
        : itemType === "post"
          ? "posts_moderation"
          : "profiles_moderation";

    return this.supabase
      .from(tableName)
      .update({
        status,
        resolved_at: new Date().toISOString(),
        resolved_by: resolvedBy,
        admin_notes: notes,
      })
      .eq("id", itemId);
  }

  async updateUserRole(userId: string, isModerator: boolean, isAdmin: boolean) {
    return this.supabase
      .from("profiles")
      .update({
        is_moderator: isModerator,
        is_admin: isAdmin,
      })
      .eq("id", userId);
  }

  async approveImage(imageUrl: string, userId: string) {
    return this.supabase.from("profile_photos").insert({
      user_id: userId,
      photo_url: imageUrl,
    });
  }

  async getModerationStats() {
    const [imagesRes, postsRes, profilesRes] = await Promise.all([
      this.supabase
        .from("images_moderation")
        .select("status", { count: "exact" }),
      this.supabase
        .from("posts_moderation")
        .select("status", { count: "exact" }),
      this.supabase
        .from("profiles_moderation")
        .select("status", { count: "exact" }),
    ]);

    return {
      totalPending:
        (imagesRes.count || 0) +
        (postsRes.count || 0) +
        (profilesRes.count || 0),
      images: imagesRes.count || 0,
      posts: postsRes.count || 0,
      profiles: profilesRes.count || 0,
    };
  }
}

// Export singleton instance
export const moderationAPI = new ModerationAPI();
