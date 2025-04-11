"use client";

import { useEffect, useState, useRef } from "react";

import { settingsService } from "@/lib/settings";
import { UserSettings } from "@/types/settings.types";

import Switch from "@/components/ui/switch";
import { YearDatePicker } from "@/components/ui/year-date-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// Using regular buttons and inputs instead of component library

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AccountSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [originalSettings, setOriginalSettings] = useState<UserSettings | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [confirmPinDialogOpen, setConfirmPinDialogOpen] = useState(false);
  const [newPin, setNewPin] = useState(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSuccess, setPinSuccess] = useState<string | null>(null);

  // Create refs for each input field
  const pinInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const confirmPinInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

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

        // Check if user has a PIN set
        const pinStatus = await fetch("/api/pin/check-pin");
        const { hasPin: userHasPin } = await pinStatus.json();

        setHasPin(userHasPin);
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

  const handlePinDigitChange = (
    index: number,
    value: string,
    isPinConfirmation: boolean = false,
  ) => {
    const digit = value.replace(/\D/g, "").slice(0, 1);

    if (isPinConfirmation) {
      const newConfirmPin = [...confirmPin];
      newConfirmPin[index] = digit;
      setConfirmPin(newConfirmPin);

      if (digit && index < confirmPin.length - 1) {
        confirmPinInputRefs[index + 1].current?.focus();
      }
    } else {
      const newPinValues = [...newPin];
      newPinValues[index] = digit;
      setNewPin(newPinValues);

      if (digit && index < newPin.length - 1) {
        pinInputRefs[index + 1].current?.focus();
      }
    }
  };

  // Handle backspace and arrow key navigation
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
    isPinConfirmation: boolean = false,
  ) => {
    const pinValues = isPinConfirmation ? confirmPin : newPin;
    const refs = isPinConfirmation ? confirmPinInputRefs : pinInputRefs;

    if (e.key === "Backspace") {
      if (pinValues[index] === "") {
        // If current field is empty and backspace is pressed, focus previous field
        if (index > 0) {
          refs[index - 1].current?.focus();
        }
      } else {
        // Clear current field
        if (isPinConfirmation) {
          const newConfirmPin = [...confirmPin];
          newConfirmPin[index] = "";
          setConfirmPin(newConfirmPin);
        } else {
          const newPinValues = [...newPin];
          newPinValues[index] = "";
          setNewPin(newPinValues);
        }
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      refs[index - 1].current?.focus();
    } else if (e.key === "ArrowRight" && index < pinValues.length - 1) {
      refs[index + 1].current?.focus();
    }
  };

  // Handle pasting of full PIN
  const handlePaste = (
    e: React.ClipboardEvent,
    isPinConfirmation: boolean = false,
  ) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4);

    if (isPinConfirmation) {
      const newConfirmPin = [...confirmPin];
      for (let i = 0; i < pastedData.length; i++) {
        newConfirmPin[i] = pastedData[i];
      }
      setConfirmPin(newConfirmPin);

      // Focus the appropriate field after pasting
      if (pastedData.length < confirmPin.length) {
        confirmPinInputRefs[pastedData.length].current?.focus();
      } else {
        confirmPinInputRefs[confirmPin.length - 1].current?.focus();
      }
    } else {
      const newPinValues = [...newPin];
      for (let i = 0; i < pastedData.length; i++) {
        newPinValues[i] = pastedData[i];
      }
      setNewPin(newPinValues);

      // Focus the appropriate field after pasting
      if (pastedData.length < newPin.length) {
        pinInputRefs[pastedData.length].current?.focus();
      } else {
        pinInputRefs[newPin.length - 1].current?.focus();
      }
    }
  };

  const setPinHandler = async () => {
    const pin = newPin.join("");

    if (pin.length !== 4) {
      setPinError("Please enter a 4-digit PIN");
      return;
    }

    setPinDialogOpen(false);
    setConfirmPinDialogOpen(true);
  };

  const confirmPinHandler = async () => {
    const pin = newPin.join("");
    const confirmPinValue = confirmPin.join("");

    if (pin !== confirmPinValue) {
      setConfirmPinDialogOpen(false);
      setPinDialogOpen(true);
      setPinError("PINs do not match. Please try again.");
      setNewPin(["", "", "", ""]);
      setConfirmPin(["", "", "", ""]);
      return;
    }

    try {
      const response = await fetch("/api/pin/set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pin }),
      });

      if (response.ok) {
        setHasPin(true);
        setPinSuccess("PIN successfully set");
        setConfirmPinDialogOpen(false);
        setNewPin(["", "", "", ""]);
        setConfirmPin(["", "", "", ""]);

        setTimeout(() => {
          window.location.reload();
        }, 250);
      } else {
        const data = await response.json();
        setPinError(data.error || "Failed to set PIN");
        setConfirmPinDialogOpen(false);
        setPinDialogOpen(true);
      }
    } catch (err) {
      setPinError("An error occurred. Please try again.");
      setConfirmPinDialogOpen(false);
      setPinDialogOpen(true);
    }
  };

  const removePinHandler = async () => {
    try {
      const response = await fetch("/api/pin/remove", {
        method: "POST",
      });

      if (response.ok) {
        setHasPin(false);
        setPinSuccess("PIN successfully removed");

        setTimeout(() => {
          window.location.reload();
        }, 250);
      } else {
        const data = await response.json();
        setPinError(data.error || "Failed to remove PIN");
      }
    } catch (err) {
      setPinError("An error occurred. Please try again.");
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

      {/* Security Settings */}
      <section className="mt-8">
        <h2 className="text-lg font-bold mb-4">Security</h2>

        <article className="flex justify-between items-center mb-4">
          <div>
            <span className="block">App Lock PIN</span>
            <span className="text-sm text-gray-500">
              {hasPin
                ? "PIN protection is enabled"
                : "Set a PIN to protect your account"}
            </span>
          </div>
          {hasPin ? (
            <button
              onClick={removePinHandler}
              className={`bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-all duration-300 ease-in-out`}
            >
              Remove PIN
            </button>
          ) : (
            <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
              <DialogTrigger asChild>
                <button className="bg-primary text-white px-4 py-2 rounded-md">
                  Set PIN
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Set a 4-digit PIN</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <div className="text-sm text-gray-500 mb-4">
                    This PIN will be required to unlock the app.
                  </div>

                  <div className="flex justify-center space-x-4 mb-6">
                    {newPin.map((digit, index) => (
                      <input
                        key={index}
                        ref={pinInputRefs[index]}
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        maxLength={1}
                        value={digit}
                        onChange={(e) =>
                          handlePinDigitChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={
                          index === 0 ? (e) => handlePaste(e) : undefined
                        }
                        className="w-14 h-14 text-center text-2xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        aria-label={`PIN digit ${index + 1}`}
                      />
                    ))}
                  </div>

                  {pinError && (
                    <div className="text-red-500 text-sm text-center mb-4">
                      {pinError}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={setPinHandler}
                      disabled={newPin.some((digit) => digit === "")}
                      className="bg-primary text-white px-4 py-2 rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </article>

        {/* PIN Confirmation Dialog */}
        <Dialog
          open={confirmPinDialogOpen}
          onOpenChange={setConfirmPinDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm your PIN</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="text-sm text-gray-500 mb-4">
                Please re-enter your PIN to confirm.
              </div>

              <div className="flex justify-center space-x-4 mb-6">
                {confirmPin.map((digit, index) => (
                  <input
                    key={index}
                    ref={confirmPinInputRefs[index]}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={1}
                    value={digit}
                    onChange={(e) =>
                      handlePinDigitChange(index, e.target.value, true)
                    }
                    onKeyDown={(e) => handleKeyDown(index, e, true)}
                    onPaste={
                      index === 0 ? (e) => handlePaste(e, true) : undefined
                    }
                    className="w-14 h-14 text-center text-2xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    aria-label={`Confirm PIN digit ${index + 1}`}
                  />
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={confirmPinHandler}
                  disabled={confirmPin.some((digit) => digit === "")}
                  className="bg-primary text-white px-4 py-2 rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Confirm
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {pinSuccess && (
          <div className="text-green-500 text-sm mb-4">{pinSuccess}</div>
        )}
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
                value as "following" | "everyone" | "none",
              )
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No one</SelectItem>
              <SelectItem value="following">People I Follow only</SelectItem>
              <SelectItem value="everyone">Everyone</SelectItem>
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
