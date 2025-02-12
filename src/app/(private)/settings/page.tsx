"use client";

import { useEffect, useState } from "react";

import Switch from "@/components/ui/switch";

import { settingsService } from "@/lib/settings";
import { UserSettings } from "@/types/settings.types";

export default function Settings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const userSettings = await settingsService.getUserSettings();
        setSettings(userSettings);
      } catch (err) {
        setError("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateSetting = async (key: keyof UserSettings, value: boolean) => {
    try {
      await settingsService.updateUserSettings({ [key]: value });
      setSettings((prev) => (prev ? { ...prev, [key]: value } : null));
    } catch (err) {
      setError("Failed to update setting");
      // Optionally revert the switch state here
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading settings...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="grid z-0">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Privacy Settings */}
      <section className="mt-[20px] flex flex-col gap-5">
        <h2 className="text-lg font-bold">Privacy</h2>

        <article className="flex justify-between items-center">
          <span>Show Sensitive Data</span>
          <Switch
            checked={settings?.allow_sensitive_content ?? false}
            onChange={(checked) =>
              updateSetting("allow_sensitive_content", checked)
            }
          />
        </article>

        <article className="flex justify-between items-center">
          <span>Blur Sensitive Data</span>
          <Switch
            checked={settings?.blur_sensitive_content ?? false}
            onChange={(checked) =>
              updateSetting("blur_sensitive_content", checked)
            }
          />
        </article>
      </section>
    </div>
  );
}
