// src/features/admin/components/settings/PreferencesTab.tsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SunIcon, MoonIcon, LanguageIcon, BellAlertIcon, EnvelopeIcon, DevicePhoneMobileIcon } from "@heroicons/react/24/outline";
import api from "@/services/api";
import { useTheme } from "@/contexts/ThemeContext";

interface UserSettings {
  theme: "light" | "dark";
  language: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export default function PreferencesTab() {
  const { t, i18n } = useTranslation();
  const { setTheme } = useTheme();
  const [settings, setSettings] = useState<UserSettings>({
    theme: "light",
    language: "en",
    emailNotifications: true,
    smsNotifications: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get("/user/settings");
      if (res.data.status === "SUCCESS") {
        const backendSettings = res.data.data;
        setSettings({
          theme: backendSettings.theme || "light",
          language: backendSettings.language || "en",
          emailNotifications: backendSettings.emailNotifications ?? true,
          smsNotifications: backendSettings.smsNotifications ?? false,
        });
        setTheme(backendSettings.theme || "light");
        const savedLang = backendSettings.language || "en";
        if (savedLang !== i18n.language) {
          i18n.changeLanguage(savedLang);
        }
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
    }
  };

  const updateSetting = async (key: keyof UserSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setLoading(true);
    setMessage(null);
    try {
      await api.patch("/user/settings", newSettings);
      setMessage({ type: "success", text: t("settings_updated") });
      setTimeout(() => setMessage(null), 3000);
      
      if (key === "theme") {
        setTheme(value);
      }
      if (key === "language") {
        i18n.changeLanguage(value);
      }
    } catch (err) {
      setMessage({ type: "error", text: t("update_failed") });
      setTimeout(() => setMessage(null), 3000);
      fetchSettings();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-3 rounded-lg ${message.type === "success" ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400"}`}>
          {message.text}
        </div>
      )}

      {/* Theme */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 rounded-xl p-5 border border-indigo-100 dark:border-indigo-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {settings.theme === "dark" ? (
              <MoonIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <SunIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            )}
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">{t('theme')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('theme_description')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => updateSetting("theme", "light")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                settings.theme === "light"
                  ? "bg-indigo-600 dark:bg-indigo-500 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              }`}
            >
              {t('light')}
            </button>
            <button
              onClick={() => updateSetting("theme", "dark")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                settings.theme === "dark"
                  ? "bg-indigo-600 dark:bg-indigo-500 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              }`}
            >
              {t('dark')}
            </button>
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl p-5 border border-purple-100 dark:border-purple-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LanguageIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">{t('language')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('language_description')}</p>
            </div>
          </div>
          <select
            value={settings.language}
            onChange={(e) => updateSetting("language", e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            disabled={loading}
          >
            <option value="en">English</option>
            <option value="am">አማርኛ (Amharic)</option>
            <option value="om">Oromo</option>
          </select>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 rounded-xl p-5 border border-green-100 dark:border-green-800">
        <div className="flex items-center gap-3 mb-4">
          <BellAlertIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">{t('notifications')}</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <EnvelopeIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('email_notifications')}</span>
            </div>
            <button
              onClick={() => updateSetting("emailNotifications", !settings.emailNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                settings.emailNotifications ? "bg-red-500 dark:bg-red-600" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                settings.emailNotifications ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DevicePhoneMobileIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('sms_notifications')}</span>
            </div>
            <button
              onClick={() => updateSetting("smsNotifications", !settings.smsNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                settings.smsNotifications ? "bg-red-500 dark:bg-red-600" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                settings.smsNotifications ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}