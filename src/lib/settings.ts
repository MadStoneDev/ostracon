import { sampleSettings } from "@/data/sample-settings";

export interface UserSettings {
  allow_sensitive_content: boolean;
  unblur_sensitive_content: boolean;
  date_of_birth: string;
  dark_mode: boolean;
}

export interface SettingsAPI {
  getUserSettings(): Promise<UserSettings>;
  updateUserSettings(settings: Partial<UserSettings>): Promise<void>;
}

class LocalStorageSettings implements SettingsAPI {
  private readonly STORAGE_KEY = "ostracon-settings";

  async getUserSettings(): Promise<UserSettings> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : sampleSettings;
  }

  async updateUserSettings(settings: Partial<UserSettings>): Promise<void> {
    const current = await this.getUserSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
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
export const settingsService: SettingsAPI = process.env.NEXT_PUBLIC_USE_SUPABASE
  ? new SupabaseSettings()
  : new LocalStorageSettings();
