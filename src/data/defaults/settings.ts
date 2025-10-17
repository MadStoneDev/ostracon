import { UserSettings } from "@/types/settings.types";

export const CURRENT_SETTINGS_VERSION = 0;

export const defaultSettings: UserSettings = {
  // Privacy
  allow_sensitive_content: false,
  blur_sensitive_content: true,

  make_profile_private: false,
  allow_messages: "followers", // 'everyone', 'followers', 'none'

  // Notifications
  email_notifications: {
    mentions: true,
    replies: true,
    follows: true,
    messages: true,
    reactions: true,
    system_updates: true,
  },

  push_notifications: {
    mentions: true,
    replies: true,
    follows: true,
    reactions: true,
    messages: true,
  },

  _version: CURRENT_SETTINGS_VERSION,
};
