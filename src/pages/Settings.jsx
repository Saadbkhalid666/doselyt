
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor, Check } from "lucide-react";

import PageHeading from "../components/shared/PageHeading.jsx";
import Button from "../components/shared/Button.jsx";
import { Field, TextInput } from "../components/shared/Form.jsx";

const SETTINGS_KEY = "doselyt_settings";

const DEFAULT_SETTINGS = {
  displayName: "Personal workspace",
};

const THEMES = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

// Safely read settings from localStorage
function readSettings() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(SETTINGS_KEY) || "{}"
    );

    return {
      displayName:
        typeof saved?.displayName === "string"
          ? saved.displayName
          : DEFAULT_SETTINGS.displayName,
    };
  } catch (error) {
    console.error("Failed to read settings:", error);
    return { ...DEFAULT_SETTINGS };
  }
}

export default function Settings({
  theme = "system",
  onThemeChange,
}) {
  const [settings, setSettings] = useState(readSettings);
  const [themeValue, setThemeValue] = useState(theme || "system");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Always use a safe string, regardless of localStorage contents.
  const displayName =
    typeof settings?.displayName === "string"
      ? settings.displayName
      : "";

  // Keep theme selection synchronized with App.jsx
  useEffect(() => {
    setThemeValue(theme || "system");
  }, [theme]);

  // Save display name
  const handleSave = () => {
    const name = displayName.trim();

    if (!name) {
      setError("Display name cannot be empty.");
      return;
    }

    try {
      const existing = JSON.parse(
        localStorage.getItem(SETTINGS_KEY) || "{}"
      );

      const safeExisting =
        existing && typeof existing === "object" && !Array.isArray(existing)
          ? existing
          : {};

      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({
          ...safeExisting,
          displayName: name,
        })
      );

      setSettings((prev) => ({
        ...prev,
        displayName: name,
      }));

      setError("");
      setSaved(true);

      window.dispatchEvent(new Event("doselyt:storage"));

      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save display name:", err);
      setError("Unable to save changes. Please try again.");
    }
  };

  // Change application theme
  const handleThemeChange = (newTheme) => {
    setThemeValue(newTheme);
    onThemeChange?.(newTheme);
  };

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeading
        title="Settings"
        description="Manage your workspace preferences."
      />

      {/* Display Name */}
      <section className="rounded-lg border border-line bg-surface shadow-card">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-sm font-medium text-ink">
            Profile
          </h2>

          <p className="mt-1 text-xs text-muted">
            Customize your workspace display name.
          </p>
        </div>

        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Field label="Display name">
             <TextInput
  type="text"
  value={displayName}
  onChange={(e) =>
    setSettings((prev) => ({
      ...prev,
      displayName: e.target.value,
    }))
  }
  placeholder="Enter your display name"
/>
            </Field>

            {error && (
              <p className="mt-2 text-xs text-crit">
                {error}
              </p>
            )}
          </div>

          <Button
            variant="primary"
            icon={Check}
            onClick={handleSave}
            disabled={!displayName.trim()}
          >
            {saved ? "Saved" : "Save changes"}
          </Button>
        </div>
      </section>

      {/* Theme */}
      <section className="rounded-lg border border-line bg-surface shadow-card">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-sm font-medium text-ink">
            Appearance
          </h2>

          <p className="mt-1 text-xs text-muted">
            Choose your preferred application theme.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 p-5">
          {THEMES.map(({ id, label, icon: Icon }) => {
            const active = themeValue === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => handleThemeChange(id)}
                aria-pressed={active}
                className={`flex flex-col items-center justify-center gap-2 rounded-lg border py-5 text-sm font-medium transition-colors ${
                  active
                    ? "border-accent bg-accent/5 text-accent ring-1 ring-accent"
                    : "border-line text-muted hover:border-muted/50 hover:text-ink"
                }`}
              >
                <Icon
                  className="h-5 w-5"
                  strokeWidth={1.75}
                />

                {label}

                {active && (
                  <span className="text-[10px] font-medium">
                    Selected
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
