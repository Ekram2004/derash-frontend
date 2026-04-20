import { useState, useRef, useEffect } from "react";
import {
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";

interface Props {
  userName: string;
  role?: "SYSTEM_ADMIN" | "AGENT_USER" | "BILLER_USER" | string;
  onLogout: () => void;
}

export default function Navbar({ userName, role, onLogout }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Convert role to label
  const getRoleLabel = () => {
    switch (role) {
      case "SYSTEM_ADMIN":
        return "Admin";
      case "AGENT_USER":
        return "Agent";
      case "BILLER_USER":
        return "Biller";
      default:
        return "User";
    }
  };

  return (
    <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-100">
      
      {/* LEFT SIDE (empty for now) */}
      <div />

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">
        
        {/* Divider */}
        <div className="w-px h-6 bg-gray-200" />

        {/* Profile Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-xl transition"
          >
            <UserCircleIcon className="w-7 h-7 text-gray-500" />

            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-gray-800 leading-none">
                {userName}
              </p>
              <p className="text-xs text-gray-400">
                {getRoleLabel()}
              </p>
            </div>

            <ChevronDownIcon
              className={`w-4 h-4 text-gray-500 transition-transform ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              
              {/* User Info */}
              <div className="px-4 py-3 border-b bg-gray-50">
                <p className="text-sm font-semibold text-gray-800">
                  {userName}
                </p>
                <p className="text-xs text-gray-400">
                  {getRoleLabel()}
                </p>
              </div>

              {/* Actions */}
              <div className="py-2">
                <button
                  onClick={onLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}