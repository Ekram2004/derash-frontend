// src/features/admin/components/settings/AccountSecurityTab.tsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  KeyIcon, 
  ComputerDesktopIcon, 
  ArrowPathIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ClipboardIcon,
  CheckIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import api from "@/services/api";
import { useAuthStore } from "@/features/auth/store/auth.store";

interface Session {
  id: string;
  userAgent: string;
  ipAddress: string;
  createdAt: string;
  expiresAt: string;
}

// ========== STRONG PASSWORD GENERATOR ==========
const generateStrongPassword = (): string => {
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowercase = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "!@#$%&*?";
  
  const getRandomChar = (str: string) => str[Math.floor(Math.random() * str.length)];
  
  // Ensure at least one of each type
  let password = "";
  password += getRandomChar(uppercase);
  password += getRandomChar(lowercase);
  password += getRandomChar(numbers);
  password += getRandomChar(symbols);
  
  // Fill the rest to reach 12-16 characters
  const allChars = uppercase + lowercase + numbers + symbols;
  const targetLength = Math.floor(Math.random() * 5) + 12; // 12-16 characters
  for (let i = password.length; i < targetLength; i++) {
    password += getRandomChar(allChars);
  }
  
  // Shuffle the password for randomness
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// ========== PASSWORD STRENGTH METER ==========
const checkPasswordStrength = (password: string): { 
  score: number; 
  label: string; 
  color: string; 
  textColor: string; 
  message: string;
  percentage: number;
} => {
  if (!password) {
    return { score: 0, label: "No Password", color: "bg-gray-300", textColor: "text-gray-500", message: "Enter a password", percentage: 0 };
  }
  
  let score = 0;
  const hasLength = password.length >= 8;
  const hasStrongLength = password.length >= 12;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  
  if (hasLength) score++;
  if (hasStrongLength) score++;
  if (hasUpper) score++;
  if (hasLower) score++;
  if (hasNumber) score++;
  if (hasSymbol) score++;
  
  const percentage = (score / 6) * 100;
  const finalScore = Math.min(Math.floor(score / 1.5), 4);
  
  const strengthMap = [
    { label: "Very Weak", color: "bg-red-500", textColor: "text-red-500", message: "Too weak – use longer password with mixed characters" },
    { label: "Weak", color: "bg-orange-500", textColor: "text-orange-500", message: "Weak – add numbers and symbols" },
    { label: "Fair", color: "bg-yellow-500", textColor: "text-yellow-500", message: "Fair – could be stronger" },
    { label: "Good", color: "bg-blue-500", textColor: "text-blue-500", message: "Good password" },
    { label: "Strong", color: "bg-green-500", textColor: "text-green-500", message: "Strong password – excellent!" }
  ];
  
  return {
    score: finalScore,
    label: strengthMap[finalScore].label,
    color: strengthMap[finalScore].color,
    textColor: strengthMap[finalScore].textColor,
    message: strengthMap[finalScore].message,
    percentage
  };
};

// ========== PASSWORD INPUT COMPONENT ==========
interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
  showStrength?: boolean;
  showCopy?: boolean;
  onCopy?: () => void;
  copied?: boolean;
}

function PasswordInput({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  required = true, 
  showStrength = false,
  showCopy = false,
  onCopy,
  copied = false
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const strength = checkPasswordStrength(value || "");
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="w-full px-4 py-2 pr-24 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition dark:bg-gray-800 dark:text-white"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {showCopy && value && onCopy && (
            <button
              type="button"
              onClick={onCopy}
              className="p-1 text-gray-400 hover:text-red-500 transition"
              title="Copy to clipboard"
            >
              {copied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <ClipboardIcon className="w-4 h-4" />}
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
          >
            {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {showStrength && value && value.length > 0 && (
        <div className="mt-2 space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${strength.color} transition-all duration-300 rounded-full`} 
                style={{ width: `${strength.percentage}%` }} 
              />
            </div>
            <span className={`text-xs font-medium ${strength.textColor}`}>
              {strength.label}
            </span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {strength.message}
          </p>
          <div className="flex flex-wrap gap-3 text-[10px]">
            <span className={`flex items-center gap-1 ${/[A-Z]/.test(value) ? 'text-green-500' : 'text-gray-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(value) ? 'bg-green-500' : 'bg-gray-400'}`} />
              Uppercase
            </span>
            <span className={`flex items-center gap-1 ${/[a-z]/.test(value) ? 'text-green-500' : 'text-gray-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${/[a-z]/.test(value) ? 'bg-green-500' : 'bg-gray-400'}`} />
              Lowercase
            </span>
            <span className={`flex items-center gap-1 ${/[0-9]/.test(value) ? 'text-green-500' : 'text-gray-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(value) ? 'bg-green-500' : 'bg-gray-400'}`} />
              Number
            </span>
            <span className={`flex items-center gap-1 ${/[^A-Za-z0-9]/.test(value) ? 'text-green-500' : 'text-gray-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${/[^A-Za-z0-9]/.test(value) ? 'bg-green-500' : 'bg-gray-400'}`} />
              Symbol
            </span>
            <span className={`flex items-center gap-1 ${value.length >= 8 ? 'text-green-500' : 'text-gray-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${value.length >= 8 ? 'bg-green-500' : 'bg-gray-400'}`} />
              8+ chars
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccountSecurityTab() {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState({ password: false, sessions: false });
  const [popup, setPopup] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const closePopup = () => setPopup(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading((prev) => ({ ...prev, sessions: true }));
    try {
      const res = await api.get("/user/sessions");
      if (res.data.status === "SUCCESS") setSessions(res.data.data);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    } finally {
      setLoading((prev) => ({ ...prev, sessions: false }));
    }
  };

  const handleGeneratePassword = () => {
    const newPass = generateStrongPassword();
    setNewPassword(newPass);
    setConfirmPassword(newPass);
  };

  const handleCopyPassword = async () => {
    if (newPassword) {
      await navigator.clipboard.writeText(newPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPopup({ type: "error", text: "New passwords do not match" });
      setTimeout(closePopup, 3000);
      return;
    }
    if (newPassword.length < 6) {
      setPopup({ type: "error", text: "Password must be at least 6 characters" });
      setTimeout(closePopup, 3000);
      return;
    }
    setLoading((prev) => ({ ...prev, password: true }));
    try {
      await api.post("/user/update-password", { currentPassword, newPassword });
      setPopup({ type: "success", text: "Password updated successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(closePopup, 3000);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to update password";
      setPopup({ type: "error", text: msg });
      setTimeout(closePopup, 3000);
    } finally {
      setLoading((prev) => ({ ...prev, password: false }));
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      await api.delete(`/user/sessions/${sessionId}`);
      fetchSessions();
      setPopup({ type: "success", text: "Session revoked" });
      setTimeout(closePopup, 3000);
    } catch (err) {
      console.error("Failed to revoke session", err);
      setPopup({ type: "error", text: "Failed to revoke session" });
      setTimeout(closePopup, 3000);
    }
  };

  const revokeAllOtherSessions = async () => {
    if (!confirm("This will log you out from all other devices. Continue?")) return;
    try {
      await api.delete("/user/sessions/purge-others");
      fetchSessions();
      setPopup({ type: "success", text: "All other sessions revoked" });
      setTimeout(closePopup, 3000);
    } catch (err) {
      console.error("Failed to revoke others", err);
      setPopup({ type: "error", text: "Failed to revoke sessions" });
      setTimeout(closePopup, 3000);
    }
  };

  return (
    <div className="space-y-8">
      {/* POPUP MODAL */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`max-w-sm w-full mx-4 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 ${
            popup.type === "success" 
              ? "bg-white dark:bg-gray-800 border-l-4 border-green-500" 
              : "bg-white dark:bg-gray-800 border-l-4 border-red-500"
          }`}>
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  popup.type === "success" 
                    ? "bg-green-100 dark:bg-green-900/30" 
                    : "bg-red-100 dark:bg-red-900/30"
                }`}>
                  {popup.type === "success" ? (
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold ${popup.type === "success" ? "text-green-800 dark:text-green-400" : "text-red-800 dark:text-red-400"}`}>
                    {popup.type === "success" ? "Success" : "Error"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{popup.text}</p>
                </div>
                <button onClick={closePopup} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className={`h-1 w-full ${popup.type === "success" ? "bg-green-500" : "bg-red-500"} animate-progress`} style={{ animation: "shrink 3s linear forwards" }}></div>
          </div>
        </div>
      )}

      {/* Change Password Section */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-5 border border-red-100 dark:border-red-800">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <KeyIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-lg">Change Password</h3>
          </div>
          <button
            type="button"
            onClick={handleGeneratePassword}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition"
          >
            <SparklesIcon className="w-4 h-4" />
            Generate Strong Password
          </button>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <PasswordInput
            label="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter your current password"
          />
          
          <PasswordInput
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            showStrength={true}
            showCopy={true}
            onCopy={handleCopyPassword}
            copied={copied}
          />
          
          <PasswordInput
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your new password"
          />
          
          <button
            type="submit"
            disabled={loading.password}
            className="w-full sm:w-auto px-6 py-2.5 bg-red-500 dark:bg-red-600 text-white rounded-lg font-semibold hover:bg-red-600 dark:hover:bg-red-700 transition disabled:opacity-50 shadow-md hover:shadow-lg"
          >
            {loading.password ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Updating...
              </span>
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      </div>

      {/* Active Sessions Section */}
      <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
          <div className="flex items-center gap-3">
            <ComputerDesktopIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-lg">Active Sessions</h3>
          </div>
          <button
            onClick={revokeAllOtherSessions}
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1"
          >
            <ArrowPathIcon className="w-4 h-4" /> Revoke all other sessions
          </button>
        </div>
        
        {loading.sessions ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent"></div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <ComputerDesktopIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No active sessions found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
                <div>
                  <p className="font-mono text-sm text-gray-800 dark:text-gray-300">{session.userAgent || "Unknown device"}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    IP: {session.ipAddress || "Unknown"} • Since {new Date(session.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => revokeSession(session.id)}
                  className="mt-2 sm:mt-0 text-red-500 dark:text-red-400 text-sm hover:underline px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-progress {
          animation: shrink 3s linear forwards;
        }
      `}</style>
    </div>
  );
}