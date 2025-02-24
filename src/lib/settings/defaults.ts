import { defaultSettings } from "@/data/defaults/settings";
import { UserSettings } from "@/types/settings.types";

export function mergeWithDefaultSettings(
  userSettings: Partial<UserSettings> | null,
): UserSettings {
  return {
    ...defaultSettings,
    ...userSettings,
  };
}

export function getDiffFromDefaults(
  settings: UserSettings,
): Partial<UserSettings> {
  const diff: Partial<UserSettings> = {};

  (Object.entries(settings) as [keyof UserSettings, any][]).forEach(
    ([key, value]) => {
      if (JSON.stringify(value) !== JSON.stringify(defaultSettings[key])) {
        diff[key] = value;
      }
    },
  );

  return diff;
}
