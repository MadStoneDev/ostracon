import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import NotificationList from "@/components/notifications/notification-list";

export default async function NotificationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: notifications } = await supabase
    .from("notifications")
    .select(
      "id, user_id, actor_id, type, fragment_id, comment_id, read, created_at",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  // Fetch actor profiles for all notifications
  const actorIds = [
    ...new Set(
      (notifications || [])
        .map((n) => n.actor_id)
        .filter(Boolean) as string[],
    ),
  ];

  let actorProfiles: Record<string, { username: string; avatar_url: string | null }> = {};

  if (actorIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .in("id", actorIds);

    if (profiles) {
      actorProfiles = Object.fromEntries(
        profiles.map((p) => [p.id, { username: p.username, avatar_url: p.avatar_url }]),
      );
    }
  }

  // Merge actor data into notifications
  const enrichedNotifications = (notifications || []).map((n) => ({
    ...n,
    actor: n.actor_id ? actorProfiles[n.actor_id] || null : null,
  }));

  return (
    <div className="grid z-0 pb-[70px]">
      <section className="pb-4 border-b border-dark/20 dark:border-light/20">
        <h1 className="text-2xl font-bold">Notifications</h1>
      </section>

      <section className="pt-4">
        <NotificationList notifications={enrichedNotifications} />
      </section>
    </div>
  );
}
