// src/shared/components/Navbar.tsx
import { BellIcon, ChevronDownIcon } from "@heroicons/react/24/solid";

interface Props {
  userName: string;
  onLogout: () => void;
}

export default function Navbar({ userName, onLogout }: Props) {
  return (
    <div className="flex justify-between items-center bg-white shadow px-6 py-4 rounded-xl mb-6">
      {/* Left side - optional search */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search..."
          className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Right side - user info and actions */}
      <div className="flex items-center gap-4">
        <button className="relative">
          <BellIcon className="w-6 h-6 text-gray-600 hover:text-gray-800" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-2 cursor-pointer">
          <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
            {userName[0].toUpperCase()}
          </div>
          <span className="font-medium">{userName}</span>
          <ChevronDownIcon className="w-4 h-4 text-gray-600" />
        </div>

        <button
          className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}