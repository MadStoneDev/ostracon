import { UserSettings } from "@/types/settings.types";
import { CURRENT_SETTINGS_VERSION } from "@/data/defaults/settings";

type MigrationFunction = (settings: any) => any;

const migrations: Record<number, MigrationFunction> = {
  1: (settings: any) => {
    return {
      ...settings,
      new_setting: false,
      _version: 1,
    };
  },
  // Add more migrations as needed
};

export function migrateSettings(settings: any): UserSettings {
  let currentSettings = { ...settings };
  const fromVersion = currentSettings._version || 0;

  for (
    let version = fromVersion + 1;
    version <= CURRENT_SETTINGS_VERSION;
    version++
  ) {
    if (migrations[version]) {
      currentSettings = migrations[version](currentSettings);
    }
  }

  return currentSettings as UserSettings;
}
