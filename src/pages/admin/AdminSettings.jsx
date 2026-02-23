import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "admin_settings_v1";

const DEFAULT_SETTINGS = {
  users: {
    allowSignup: true,
    defaultRole: "customer",
  },
  security: {
    twoFA: false,
    sessionTimeout: 30,
  },
  notifications: {
    emailAlerts: true,
    orderAlerts: true,
    lowStockAlerts: false,
  },
  appearance: {
    theme: "dark", // demo only
    compactMode: false,
  },
};

export default function AdminSettings() {
  const tabs = useMemo(
    () => [
      { key: "Users", icon: "👥" },
      { key: "Security", icon: "🔒" },
      { key: "Notifications", icon: "🔔" },
      { key: "Appearance", icon: "🎨" },
    ],
    []
  );

  const [activeTab, setActiveTab] = useState("Users");
  const [open, setOpen] = useState(false);

  // ✅ persisted settings
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // ✅ snapshot for "dirty" check
  const [savedSnapshot, setSavedSnapshot] = useState(DEFAULT_SETTINGS);

  // ✅ load saved settings once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const merged = deepMerge(DEFAULT_SETTINGS, parsed);
        setSettings(merged);
        setSavedSnapshot(merged);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const isDirty = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(savedSnapshot);
  }, [settings, savedSnapshot]);

  // ✅ Lock background scroll when modal open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  // ✅ ESC to close
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const openTab = (t) => {
    setActiveTab(t);
    setOpen(true);
  };

  const onSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSavedSnapshot(settings);
    setOpen(false);
  };

  const onReset = () => {
    setSettings(savedSnapshot);
  };

  // ✅ demo: appearance affects this UI only
  const theme = settings.appearance.theme;
  const compact = settings.appearance.compactMode;

  const shellBg =
    theme === "light"
      ? "bg-white/90 text-slate-900"
      : "bg-[#0b1d4d] text-white";

  const shellBorder =
    theme === "light"
      ? "border border-slate-200"
      : "border border-white/10";

  const cardBg =
    theme === "light" ? "bg-slate-100" : "bg-white/5 border border-white/10";

  const inputBg =
    theme === "light"
      ? "bg-white border border-slate-200 text-slate-900"
      : "bg-[#050b2c] border border-white/10 text-white";

  const spacing = compact ? "p-3" : "p-4";

  return (
    <div className="text-white">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Settings</h1>
          <p className="text-white/70 text-sm sm:text-base mt-1">
            Manage users, security, notifications and appearance.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => openTab("Users")}
            className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 transition px-4 py-2.5 rounded-xl font-semibold"
          >
            Open Settings
          </button>
        </div>
      </div>

      {/* Tabs row */}
      <div className="-mx-2 px-2">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => openTab(t.key)}
              className={`shrink-0 px-4 py-2 rounded-xl border transition text-sm sm:text-base ${
                activeTab === t.key
                  ? "bg-white/15 border-white/30"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <span className="mr-2">{t.icon}</span>
              {t.key}
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />

          {/* Modal / Bottom sheet */}
          <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center">
            <div
              className={`relative z-10 w-full sm:w-[95%] sm:max-w-3xl rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[88vh] sm:max-h-[85vh] flex flex-col overflow-hidden ${shellBg} ${shellBorder}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 px-4 sm:px-6 py-4 border-b border-white/10">
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold">Admin Settings</h2>
                  <p className={theme === "light" ? "text-slate-600 text-xs sm:text-sm" : "text-white/70 text-xs sm:text-sm"}>
                    Currently editing:{" "}
                    <span className={theme === "light" ? "text-slate-900 font-semibold" : "text-white font-semibold"}>
                      {activeTab}
                    </span>
                    {isDirty && (
                      <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-200 text-[11px]">
                        ● Unsaved
                      </span>
                    )}
                  </p>
                </div>

                <button
                  onClick={() => setOpen(false)}
                  className={theme === "light"
                    ? "shrink-0 px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 transition"
                    : "shrink-0 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition"}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className={`px-4 sm:px-6 py-5 overflow-y-auto scrollbar-hide ${compact ? "space-y-4" : "space-y-5"}`}>
                {/* Inner tabs */}
                <div className="-mx-2 px-2">
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {tabs.map((t) => (
                      <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`shrink-0 px-4 py-2 rounded-xl border transition text-sm sm:text-base ${
                          activeTab === t.key
                            ? "bg-indigo-500 border-indigo-400 text-white"
                            : theme === "light"
                            ? "bg-white border-slate-200 hover:bg-slate-100 text-slate-800"
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <span className="mr-2">{t.icon}</span>
                        {t.key}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content */}
                {activeTab === "Users" && (
                  <UsersSettings
                    cardBg={cardBg}
                    inputBg={inputBg}
                    spacing={spacing}
                    value={settings.users}
                    onChange={(next) =>
                      setSettings((s) => ({ ...s, users: next }))
                    }
                    theme={theme}
                  />
                )}

                {activeTab === "Security" && (
                  <SecuritySettings
                    cardBg={cardBg}
                    inputBg={inputBg}
                    spacing={spacing}
                    value={settings.security}
                    onChange={(next) =>
                      setSettings((s) => ({ ...s, security: next }))
                    }
                    theme={theme}
                  />
                )}

                {activeTab === "Notifications" && (
                  <NotificationsSettings
                    cardBg={cardBg}
                    spacing={spacing}
                    value={settings.notifications}
                    onChange={(next) =>
                      setSettings((s) => ({ ...s, notifications: next }))
                    }
                    theme={theme}
                  />
                )}

                {activeTab === "Appearance" && (
                  <AppearanceSettings
                    cardBg={cardBg}
                    spacing={spacing}
                    value={settings.appearance}
                    onChange={(next) =>
                      setSettings((s) => ({ ...s, appearance: next }))
                    }
                    theme={theme}
                  />
                )}
              </div>

              {/* Footer */}
              <div className={`px-4 sm:px-6 py-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
                <div className={theme === "light" ? "text-slate-600 text-xs" : "text-white/60 text-xs"}>
                  Settings are saved to <b>localStorage</b> (frontend). Connect backend later.
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
                  <button
                    onClick={onReset}
                    disabled={!isDirty}
                    className={`w-full sm:w-auto px-4 py-2.5 rounded-xl transition font-semibold disabled:opacity-50 ${
                      theme === "light"
                        ? "bg-slate-200 hover:bg-slate-300 text-slate-900"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                  >
                    Reset
                  </button>

                  <button
                    onClick={() => setOpen(false)}
                    className={`w-full sm:w-auto px-4 py-2.5 rounded-xl transition ${
                      theme === "light"
                        ? "bg-slate-100 hover:bg-slate-200 text-slate-900"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={onSave}
                    disabled={!isDirty}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 transition font-semibold disabled:opacity-50"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Mobile safe space */}
              <div className="h-2 sm:hidden" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------- TAB COMPONENTS -------------------- */

function UsersSettings({ value, onChange, cardBg, inputBg, spacing, theme }) {
  return (
    <div className="space-y-4">
      <SectionTitle theme={theme} title="Users" subtitle="Signup access + default role." />

      <div className={`${cardBg} rounded-2xl ${spacing}`}>
        <ToggleRow
          theme={theme}
          label="Allow new user signup"
          desc="If OFF, only admin can create users."
          checked={value.allowSignup}
          onChange={(checked) => onChange({ ...value, allowSignup: checked })}
        />
      </div>

      <div className={`${cardBg} rounded-2xl ${spacing}`}>
        <p className="font-semibold mb-2">Default role for new users</p>
        <select
          value={value.defaultRole}
          onChange={(e) => onChange({ ...value, defaultRole: e.target.value })}
          className={`w-full rounded-xl px-4 py-3 outline-none ${inputBg}`}
        >
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
        </select>
        <p className={theme === "light" ? "text-slate-600 text-sm mt-2" : "text-white/70 text-sm mt-2"}>
          Usually keep it as <b>Customer</b>.
        </p>
      </div>
    </div>
  );
}

function SecuritySettings({ value, onChange, cardBg, inputBg, spacing, theme }) {
  return (
    <div className="space-y-4">
      <SectionTitle theme={theme} title="Security" subtitle="2FA + auto logout timer." />

      <div className={`${cardBg} rounded-2xl ${spacing}`}>
        <ToggleRow
          theme={theme}
          label="Enable 2FA (Two-factor auth)"
          desc="Extra security for admin login."
          checked={value.twoFA}
          onChange={(checked) => onChange({ ...value, twoFA: checked })}
        />
      </div>

      <div className={`${cardBg} rounded-2xl ${spacing}`}>
        <p className="font-semibold mb-2">Auto logout (minutes)</p>
        <input
          type="number"
          value={value.sessionTimeout}
          onChange={(e) =>
            onChange({ ...value, sessionTimeout: Math.max(5, Number(e.target.value || 5)) })
          }
          min={5}
          className={`w-full rounded-xl px-4 py-3 outline-none ${inputBg}`}
        />
        <p className={theme === "light" ? "text-slate-600 text-sm mt-2" : "text-white/70 text-sm mt-2"}>
          Example: <b>30</b> minutes (recommended).
        </p>
      </div>
    </div>
  );
}

function NotificationsSettings({ value, onChange, cardBg, spacing, theme }) {
  return (
    <div className="space-y-4">
      <SectionTitle theme={theme} title="Notifications" subtitle="Choose what alerts you want." />

      <div className={`${cardBg} rounded-2xl ${spacing} space-y-4`}>
        <ToggleLine
          theme={theme}
          label="Email alerts"
          checked={value.emailAlerts}
          onChange={(checked) => onChange({ ...value, emailAlerts: checked })}
        />

        <ToggleLine
          theme={theme}
          label="New order alerts"
          checked={value.orderAlerts}
          onChange={(checked) => onChange({ ...value, orderAlerts: checked })}
        />

        <ToggleLine
          theme={theme}
          label="Low stock alerts"
          checked={value.lowStockAlerts}
          onChange={(checked) => onChange({ ...value, lowStockAlerts: checked })}
        />

        <p className={theme === "light" ? "text-slate-600 text-sm" : "text-white/70 text-sm"}>
          You can connect these with backend later (save to DB).
        </p>
      </div>
    </div>
  );
}

function AppearanceSettings({ value, onChange, cardBg, spacing, theme }) {
  return (
    <div className="space-y-4">
      <SectionTitle theme={theme} title="Appearance" subtitle="Demo UI settings for this panel." />

      <div className={`${cardBg} rounded-2xl ${spacing}`}>
        <p className="font-semibold mb-2">Theme</p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onChange({ ...value, theme: "dark" })}
            className={`px-4 py-2 rounded-xl border transition font-semibold ${
              value.theme === "dark"
                ? "bg-indigo-500 border-indigo-400 text-white"
                : theme === "light"
                ? "bg-white border-slate-200 hover:bg-slate-100 text-slate-900"
                : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
            }`}
          >
            Dark
          </button>

          <button
            onClick={() => onChange({ ...value, theme: "light" })}
            className={`px-4 py-2 rounded-xl border transition font-semibold ${
              value.theme === "light"
                ? "bg-indigo-500 border-indigo-400 text-white"
                : theme === "light"
                ? "bg-white border-slate-200 hover:bg-slate-100 text-slate-900"
                : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
            }`}
          >
            Light
          </button>
        </div>

        <p className={theme === "light" ? "text-slate-600 text-sm mt-2" : "text-white/70 text-sm mt-2"}>
          This is demo-only. Real theme switching can be added later.
        </p>
      </div>

      <div className={`${cardBg} rounded-2xl ${spacing}`}>
        <ToggleRow
          theme={theme}
          label="Compact mode"
          desc="Reduce spacing for cards and tables."
          checked={value.compactMode}
          onChange={(checked) => onChange({ ...value, compactMode: checked })}
        />
      </div>
    </div>
  );
}

/* -------------------- SMALL UI PARTS -------------------- */

function SectionTitle({ title, subtitle, theme }) {
  return (
    <div>
      <h3 className={theme === "light" ? "text-slate-900 text-lg font-bold" : "text-base sm:text-lg font-bold"}>
        {title}
      </h3>
      <p className={theme === "light" ? "text-slate-600 text-sm mt-1" : "text-white/70 text-sm mt-1"}>
        {subtitle}
      </p>
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange, theme }) {
  return (
    <label className="flex items-center justify-between gap-4">
      <div>
        <p className="font-semibold">{label}</p>
        <p className={theme === "light" ? "text-slate-600 text-sm" : "text-white/70 text-sm"}>{desc}</p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-7 rounded-full transition border ${
          checked
            ? "bg-emerald-500 border-emerald-300/40"
            : theme === "light"
            ? "bg-slate-200 border-slate-300"
            : "bg-white/10 border-white/15"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-1 left-1 h-5 w-5 rounded-full transition ${
            checked ? "translate-x-5 bg-white" : theme === "light" ? "bg-white" : "bg-white/80"
          }`}
        />
      </button>
    </label>
  );
}

function ToggleLine({ label, checked, onChange, theme }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-semibold">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5"
      />
    </div>
  );
}

/* -------------------- UTILS -------------------- */

function deepMerge(base, incoming) {
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const key of Object.keys(incoming || {})) {
    const a = base?.[key];
    const b = incoming?.[key];
    if (a && typeof a === "object" && !Array.isArray(a) && b && typeof b === "object" && !Array.isArray(b)) {
      out[key] = deepMerge(a, b);
    } else {
      out[key] = b;
    }
  }
  return out;
}
