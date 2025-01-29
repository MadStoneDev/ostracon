"use client";

import Switch from "@/components/ui/switch";
import { sampleSettings } from "@/data/sample-settings";
import { useEffect, useState } from "react";
import { settingsService, UserSettings } from "@/lib/settings";

export default function Settings() {
  // States
  const [settings, setSettings] = useState<UserSettings | null>(null);

  // Effects
  useEffect(() => {
    settingsService.getUserSettings().then(setSettings);
  }, []);

  return (
    <div className={`grid z-0`}>
      <h1 className={`text-2xl font-bold`}>Settings</h1>

      {/* TODO: Sprint #3 */}
      {/*<section className={`mt-[20px]`}>*/}
      {/*  <h2 className={`text-lg font-bold`}>Security</h2>*/}
      {/*    */}
      {/*</section>*/}

      {/* Privacy Settings */}
      <section className={`mt-[20px] flex flex-col gap-5`}>
        <h2 className={`text-lg font-bold`}>Privacy</h2>

        {/*allow_sensitive_content: true,*/}
        {/*unblur_sensitive_content: true,*/}
        {/*date_of_birth: "",*/}
        {/*dark_mode: false,*/}

        <article className={`flex justify-between`}>
          <span>Show Sensitive Data</span>
          <Switch
            checked={settings ? settings.allow_sensitive_content : false}
            onChange={async (checked) =>
              await settingsService.updateUserSettings({
                allow_sensitive_content: checked,
              })
            }
          />
        </article>

        <article className={`flex justify-between`}>
          <span>Unblur Sensitive Data by Default</span>
          <Switch
            checked={settings ? settings.unblur_sensitive_content : false}
            onChange={(checked) =>
              settingsService.updateUserSettings({
                unblur_sensitive_content: checked,
              })
            }
          />
        </article>

        <article className={`flex justify-between`}>
          <span>Show Sensitive Data</span>
        </article>
      </section>
    </div>
  );
}
