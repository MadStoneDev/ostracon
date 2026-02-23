"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "@/actions/notification-actions";
import UserAvatar from "@/components/ui/user-avatar";
import {
  IconHeart,
  IconMessage,
  IconUserPlus,
  IconCheck,
  IconTrash,
  IconChecks,
} from "@tabler/icons-react";

type NotificationRow = {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: string;
  fragment_id: string | null;
  comment_id: string | null;
  read: boolean | null;
  created_at: string | null;
  actor?: {
    username: string;
    avatar_url: string | null;
  } | null;
};

type NotificationListProps = {
  notifications: NotificationRow[];
};

function getNotificationText(type: string, actorName: string): string {
  switch (type) {
    case "comment":
      return `${actorName} commented on your post`;
    case "reaction":
      return `${actorName} liked your post`;
    case "follow":
      return `${actorName} started listening to you`;
    default:
      return `${actorName} interacted with you`;
  }
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "comment":
      return <IconMessage size={20} />;
    case "reaction":
      return <IconHeart size={20} />;
    case "follow":
      return <IconUserPlus size={20} />;
    default:
      return <IconMessage size={20} />;
  }
}

function getNotificationLink(notification: NotificationRow): string {
  if (notification.type === "follow" && notification.actor?.username) {
    return `/profile/${notification.actor.username}`;
  }
  if (notification.fragment_id) {
    return `/post/${notification.fragment_id}`;
  }
  return "#";
}

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationList({
  notifications: initialNotifications,
}: NotificationListProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const hasUnread = notifications.some((n) => !n.read);

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true })),
    );

    const result = await markAllNotificationsRead();
    if (!result.success) {
      // Revert on failure
      setNotifications(initialNotifications);
    }
    setIsMarkingAll(false);
  };

  const handleMarkRead = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n,
      ),
    );

    await markNotificationRead(notificationId);
  };

  const handleDelete = async (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

    const result = await deleteNotification(notificationId);
    if (!result.success) {
      setNotifications(initialNotifications);
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No notifications yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {/* Mark all as read button */}
      {hasUnread && (
        <div className="flex justify-end mb-2">
          <button
            onClick={handleMarkAllRead}
            disabled={isMarkingAll}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-bold rounded-full bg-neutral-200/70 dark:bg-neutral-50/10 hover:bg-neutral-300 dark:hover:bg-neutral-50/20 transition-all duration-300 ease-in-out disabled:opacity-50"
          >
            <IconChecks size={16} />
            Mark all as read
          </button>
        </div>
      )}

      {/* Notification items */}
      {notifications.map((notification) => {
        const actorName = notification.actor?.username || "Someone";
        const link = getNotificationLink(notification);
        const isUnread = !notification.read;

        return (
          <div
            key={notification.id}
            className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-300 ease-in-out ${
              isUnread
                ? "bg-primary/10 dark:bg-primary/20 font-semibold"
                : "bg-neutral-200/70 dark:bg-neutral-50/10"
            }`}
          >
            {/* Icon */}
            <div className="shrink-0 mt-1 opacity-60">
              {getNotificationIcon(notification.type)}
            </div>

            {/* Actor avatar */}
            {notification.actor && (
              <div className="shrink-0">
                <UserAvatar
                  username={notification.actor.username}
                  avatar_url={notification.actor.avatar_url || ""}
                  avatarSize="w-8 h-8"
                  textSize="text-sm"
                />
              </div>
            )}

            {/* Content */}
            <Link href={link} className="flex-grow min-w-0" onClick={() => {
              if (isUnread) handleMarkRead(notification.id);
            }}>
              <p className="text-sm">
                {getNotificationText(notification.type, actorName)}
              </p>
              {notification.created_at && (
                <span className="text-xs opacity-50">
                  {timeAgo(notification.created_at)}
                </span>
              )}
            </Link>

            {/* Actions */}
            <div className="shrink-0 flex gap-1">
              {isUnread && (
                <button
                  onClick={() => handleMarkRead(notification.id)}
                  className="p-1 opacity-40 hover:opacity-100 transition-opacity"
                  title="Mark as read"
                  aria-label="Mark notification as read"
                >
                  <IconCheck size={16} />
                </button>
              )}
              <button
                onClick={() => handleDelete(notification.id)}
                className="p-1 opacity-40 hover:opacity-100 transition-opacity text-red-500"
                title="Delete"
                aria-label="Delete notification"
              >
                <IconTrash size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
