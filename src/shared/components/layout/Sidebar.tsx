// src/shared/components/layout/Sidebar.tsx
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  UserGroupIcon,
  BanknotesIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

interface LinkItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface Props {
  links: LinkItem[];
}

export default function Sidebar({ links }: Props) {
  const location = useLocation();

  return (
    <aside className="w-72 bg-white border-r shadow-sm flex flex-col p-6">
      
      {/* Logo / Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Admin Panel
        </h1>
        <div className="mt-2 h-1 w-12 bg-red-500 rounded-full"></div>
      </div>

      {/* Links */}
      <ul className="flex-1 space-y-2">
        {links.map((link) => {
          const isActive = location.pathname === link.path;

          return (
            <li key={link.path}>
              <Link
                to={link.path}
               className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium tracking-wide transition-all duration-200 group ${
  isActive
    ? "bg-red-500 text-white shadow-md font-semibold"
    : "text-gray-600 hover:bg-red-50 hover:text-red-600"
}`}
              >
                <span
                  className={`transition-colors duration-200 ${
                    isActive
                      ? "text-white"
                      : "text-gray-400 group-hover:text-red-500"
                  }`}
                >
                  {link.icon}
                </span>

                <span>{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Logout */}
      <button className="w-full mt-6 bg-red-500 text-white py-3 rounded-xl font-semibold shadow-sm hover:bg-red-600 hover:shadow-md transition-all duration-200">
        Logout
      </button>
    </aside>
  );
}