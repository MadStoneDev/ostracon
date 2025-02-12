import { sampleSettings } from "@/data/sample-settings";
import { UserSettings } from "@/types/settings.types";

export interface SettingsAPI {
  getUserSettings(): Promise<UserSettings>;
  updateUserSettings(settings: Partial<UserSettings>): Promise<void>;
}

class LocalStorageSettings implements SettingsAPI {
  private readonly STORAGE_KEY = "ostracon-settings";

  async getUserSettings(): Promise<UserSettings> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);

      if (!stored) return sampleSettings;

      const parsed = JSON.parse(stored);
      return { ...sampleSettings, ...parsed };
    } catch (error) {
      console.error(error);
      return sampleSettings;
    }
  }

  async updateUserSettings(settings: Partial<UserSettings>): Promise<void> {
    try {
      const current = await this.getUserSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error(error);
      throw new Error("Failed to update user settings");
    }
  }
}

// Future Supabase implementation
class SupabaseSettings implements SettingsAPI {
  async getUserSettings(): Promise<UserSettings> {
    // TODO: Replace with actual Supabase query
    throw new Error("Not implemented");
  }

  async updateUserSettings(settings: Partial<UserSettings>): Promise<void> {
    // TODO: Replace with actual Supabase update
    throw new Error("Not implemented");
  }
}

// Export a single instance based on environment
export const createSettingsService = (): SettingsAPI => {
  if (process.env.NEXT_PUBLIC_USE_SUPABASE === "true") {
    return new SupabaseSettings();
  }

  return new LocalStorageSettings();
};

export const settingsService = createSettingsService();
