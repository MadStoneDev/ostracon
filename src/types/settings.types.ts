export interface UserSettings {
  // Privacy
  date_of_birth: string;
  allow_sensitive_content: boolean;
  blur_sensitive_content: boolean;

  make_profile_private: boolean;
  allow_messages: "followers" | "everyone" | "none";

  // Notifications
  email_notifications: {
    mentions: boolean;
    replies: boolean;
    follows: boolean;
    messages: boolean;
    reactions: boolean;
    system_updates: boolean;
  };

  push_notifications: {
    mentions: boolean;
    replies: boolean;
    follows: boolean;
    reactions: boolean;
    messages: boolean;
  };

  _version: number;
}
