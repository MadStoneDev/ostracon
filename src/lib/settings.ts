import { createClient } from "@/utils/supabase/client";
import { UserSettings } from "@/types/settings.types";
import { defaultSettings } from "@/data/defaults/settings";

export interface SettingsAPI {
  getUserSettings(): Promise<UserSettings>;
  updateUserSettings(settings: Partial<UserSettings>): Promise<void>;
}

class SupabaseSettings implements SettingsAPI {
  async getUserSettings(): Promise<UserSettings> {
    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Not authenticated");

      const { data: userData, error: settingsError } = await supabase
        .from("profiles")
        .select("date_of_birth, settings")
        .eq("id", user.id)
        .single();

      if (settingsError) {
        console.error("Error fetching settings:", settingsError);
        throw new Error("Failed to fetch settings");
      }

      // Merge with default settings and return
      return {
        ...defaultSettings,
        ...(userData?.settings || {}),
        date_of_birth: userData?.date_of_birth || null,
      };
    } catch (error) {
      console.error("Error in getUserSettings:", error);
      return defaultSettings;
    }
  }

  async updateUserSettings(settings: Partial<UserSettings>): Promise<void> {
    // This will now separately handle date_of_birth
    const { date_of_birth, ...otherSettings } = settings;

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Not authenticated");

      // Update profiles table directly for date_of_birth
      const { error: dateError } = await supabase
        .from("profiles")
        .update({ date_of_birth })
        .eq("id", user.id);

      // Update settings column for other settings
      const { error: settingsError } = await supabase
        .from("profiles")
        .update({ settings: otherSettings })
        .eq("id", user.id);
    } catch (error) {
      console.error("Could not update settings. Try again later.");
    }
  }
}

export const createSettingsService = (): SettingsAPI => {
  return new SupabaseSettings();
};

export const settingsService = createSettingsService();
