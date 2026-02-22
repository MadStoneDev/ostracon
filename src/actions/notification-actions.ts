"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

type ActionResult<T = null> = {
  success: boolean;
  error?: string;
  data?: T;
};

export async function markNotificationRead(
  notificationId: string,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: "Failed to mark notification as read" };
  }

  return { success: true };
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);

  if (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false, error: "Failed to mark all notifications as read" };
  }

  revalidatePath("/notifications");

  return { success: true };
}

export async function deleteNotification(
  notificationId: string,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting notification:", error);
    return { success: false, error: "Failed to delete notification" };
  }

  revalidatePath("/notifications");

  return { success: true };
}

export async function createNotification(data: {
  userId: string;
  actorId: string;
  type: string;
  fragmentId?: string;
  commentId?: string;
}): Promise<ActionResult> {
  const supabase = await createClient();

  // Don't notify yourself
  if (data.userId === data.actorId) {
    return { success: true };
  }

  const { error } = await supabase.from("notifications").insert({
    user_id: data.userId,
    actor_id: data.actorId,
    type: data.type,
    fragment_id: data.fragmentId || null,
    comment_id: data.commentId || null,
  });

  if (error) {
    // Don't fail the parent action if notification fails
    console.error("Error creating notification:", error);
  }

  return { success: true };
}
