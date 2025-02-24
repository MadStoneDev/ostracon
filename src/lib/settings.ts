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
        .from("users")
        .select("settings")
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
      };
    } catch (error) {
      console.error("Error in getUserSettings:", error);
      return defaultSettings;
    }
  }

  async updateUserSettings(settings: Partial<UserSettings>): Promise<void> {
    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Not authenticated");

      const { data: currentData, error: fetchError } = await supabase
        .from("users")
        .select("settings")
        .eq("id", user.id)
        .single();

      if (fetchError) {
        console.error("Error fetching current settings:", fetchError);
        throw new Error("Failed to fetch current settings");
      }

      const updatedSettings = {
        ...(currentData?.settings || {}),
        ...settings,
      };

      const { error: updateError } = await supabase
        .from("users")
        .update({ settings: updatedSettings })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error updating settings:", updateError);
        throw new Error("Failed to update settings");
      }
    } catch (error) {
      console.error("Error in updateUserSettings:", error);
      throw new Error("Failed to update user settings");
    }
  }
}

export const createSettingsService = (): SettingsAPI => {
  return new SupabaseSettings();
};

export const settingsService = createSettingsService();
