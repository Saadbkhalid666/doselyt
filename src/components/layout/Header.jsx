
import { Moon, Sun, User } from "lucide-react";

import { IconButton } from "../shared/Button.jsx";
import { Logo } from "./Sidebar.jsx";

const SETTINGS_KEY = "doselyt_settings";

function getProfileName(profile) {
  if (typeof profile === "string") return profile;

  if (profile && typeof profile?.displayName === "string") {
    return profile.displayName;
  }

  try {
    const saved = JSON.parse(
      localStorage.getItem(SETTINGS_KEY) || "{}"
    );

    if (typeof saved.displayName === "string") {
      return saved.displayName;
    }
  } catch (error) {
    console.error("Failed to read profile:", error);
  }

  return "Personal workspace";
}

function getInitials(name) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (!words.length) return "U";

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

export default function Header({
  pageLabel = "Dashboard",
  date,
  isDark = false,
  onToggleTheme,
  profile,
}) {
  const profileName = getProfileName(profile);
  const initials = getInitials(profileName);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-bg/80 px-4 backdrop-blur sm:px-6 lg:px-8">
      {/* Mobile logo */}
      <div className="lg:hidden">
        <Logo />
      </div>

      {/* Desktop breadcrumb */}
      <div className="hidden items-center gap-2 text-sm lg:flex">
        <span className="text-muted">Doselyt</span>
        <span className="text-line">/</span>
        <span className="font-medium text-ink">{pageLabel}</span>
      </div>

      {/* Header actions */}
      <div className="ml-auto flex items-center gap-2">
        {date && (
          <span className="mr-2 hidden text-sm text-muted md:block">
            {date}
          </span>
        )}

        <IconButton
          icon={isDark ? Sun : Moon}
          label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          onClick={onToggleTheme}
        />

        {/* Profile initials */}
        <div
          title={profileName}
          aria-label={`Profile: ${profileName}`}
          className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-subtle text-xs font-semibold text-ink"
        >
          {initials || <User size={15} />}
        </div>
      </div>
    </header>
  );
}
