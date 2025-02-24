"use client";

import { useEffect, useState } from "react";

import { settingsService } from "@/lib/settings";
import { UserSettings } from "@/types/settings.types";

import Switch from "@/components/ui/switch";
import { YearDatePicker } from "@/components/ui/year-date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Settings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [originalSettings, setOriginalSettings] = useState<UserSettings | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const userSettings = await settingsService.getUserSettings();

        // Check if sensitive content settings need to be adjusted
        if (
          !userSettings.date_of_birth &&
          userSettings.allow_sensitive_content
        ) {
          const correctedSettings = {
            ...userSettings,
            allow_sensitive_content: false,
            blur_sensitive_content: false,
          };

          // Save the corrected settings
          await settingsService.updateUserSettings(correctedSettings);
          setSettings(correctedSettings);
          setOriginalSettings(correctedSettings);
        } else {
          setSettings(userSettings);
          setOriginalSettings(userSettings);
        }
      } catch (err) {
        setError("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    // Check if current settings differ from original
    setHasChanges(
      JSON.stringify(settings) !== JSON.stringify(originalSettings),
    );
  }, [settings, originalSettings]);

  const updateSetting = async (key: keyof UserSettings, value: any) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : null));
  };

  const saveChanges = async () => {
    if (!settings) {
      setError("No settings to save");
      return;
    }

    try {
      await settingsService.updateUserSettings(settings);
      setOriginalSettings(settings);
      setHasChanges(false);
    } catch (err) {
      setError("Failed to save settings");
    }
  };

  if (loading) return <div className="animate-pulse">Loading settings...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!settings) return null;

  return (
    <div className="relative">
      {hasChanges && (
        <div className="fixed top-20 right-6 z-50">
          <button
            onClick={saveChanges}
            className="bg-primary text-white px-4 py-2 rounded-md shadow-lg hover:bg-primary/90 transition-colors"
          >
            Save Changes
          </button>
        </div>
      )}

      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Profile Settings */}
      <section className="mt-8">
        <h2 className="text-lg font-bold mb-4">Profile</h2>

        <article className="flex flex-col mb-4">
          <div className="flex justify-between items-center gap-2">
            <label className="shrink-0 block text-sm font-medium">
              Date of Birth
              <span className="text-red-500 ml-1">*</span>
            </label>
            <YearDatePicker
              value={
                settings.date_of_birth
                  ? new Date(settings.date_of_birth)
                  : undefined
              }
              onChange={(date) =>
                updateSetting("date_of_birth", date ? date.toISOString() : "")
              }
              disabled={!!originalSettings?.date_of_birth}
            />
          </div>
          {!!originalSettings?.date_of_birth && (
            <p className="text-sm text-gray-500">
              Contact support to update your date of birth
            </p>
          )}
          {!settings.date_of_birth && (
            <p className="text-sm text-amber-600">
              Required to enable sensitive content settings
            </p>
          )}
        </article>
      </section>

      {/* Privacy Settings */}
      <section className="mt-8">
        <h2 className="text-lg font-bold mb-4">Privacy</h2>

        <article className="flex justify-between items-center mb-4">
          <span className={`block`}>Make profile private</span>
          <Switch
            checked={settings.make_profile_private}
            onChange={(checked) =>
              updateSetting("make_profile_private", checked)
            }
          />
        </article>

        <article className="flex justify-between items-center mb-4">
          <div>
            <span
              className={`block ${!settings.date_of_birth && "opacity-30"}`}
            >
              Show Sensitive Content
            </span>
            <span className="text-sm text-amber-600">
              {!settings.date_of_birth &&
                "Set your date of birth to enable this setting"}
            </span>
          </div>
          <Switch
            checked={settings.allow_sensitive_content}
            onChange={(checked) =>
              updateSetting("allow_sensitive_content", checked)
            }
            disabled={!settings.date_of_birth}
          />
        </article>

        <article className="flex justify-between items-center">
          <span
            className={`${!settings.allow_sensitive_content && "opacity-30"}`}
          >
            Blur Sensitive Content
          </span>
          <Switch
            checked={settings.blur_sensitive_content}
            onChange={(checked) =>
              updateSetting("blur_sensitive_content", checked)
            }
            disabled={!settings.allow_sensitive_content}
          />
        </article>
      </section>

      {/* Messaging Settings */}
      <section className="mt-8">
        <h2 className="text-lg font-bold mb-4">Messaging</h2>

        <article className="flex justify-between items-center">
          <span>Allow Messages from</span>
          <Select
            value={settings.allow_messages}
            onValueChange={(value) =>
              updateSetting(
                "allow_messages",
                value as "followers" | "everyone" | "none",
              )
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="followers">Followers only</SelectItem>
              <SelectItem value="everyone">Everyone</SelectItem>
              <SelectItem value="none">No one</SelectItem>
            </SelectContent>
          </Select>
        </article>
      </section>

      {/* Account Tools */}
      {/*<section className="mt-8">*/}
      {/*  <h2 className="text-lg font-bold mb-4">Account</h2>*/}

      {/*  <article className="flex justify-between items-center">*/}
      {/*    <span>Download my Data Archive</span>*/}
      {/*    <button*/}
      {/*      className={`text-primary opacity-70 hover:opacity-100 transition-all duration-300 ease-in-out`}*/}
      {/*    >*/}
      {/*      Download*/}
      {/*    </button>*/}
      {/*  </article>*/}
      {/*</section>*/}

      {/* Danger Settings */}
      {/*<section className="mt-8">*/}
      {/*  <h2 className="text-lg font-bold mb-4">Danger Zone</h2>*/}

      {/*  <article className="flex justify-between items-center">*/}
      {/*    <span>Delete Account</span>*/}
      {/*    <button*/}
      {/*      className={`px-4 py-1 bg-red-500 text-white opacity-70 hover:opacity-100 transition-all duration-300 ease-in-out`}*/}
      {/*    >*/}
      {/*      Delete*/}
      {/*    </button>*/}
      {/*  </article>*/}
      {/*</section>*/}
    </div>
  );
}
