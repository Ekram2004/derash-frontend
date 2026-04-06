import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth.store";
import Navbar from "@/shared/components/layout/Navbar";

interface LinkItem {
  label: string;
  path: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface Props {
  title: string;
  links: LinkItem[];
  children: ReactNode;
}

export default function DashboardLayout({ title, links, children }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
            {title}
          </h2>
          <div className="mt-2 h-1 w-12 bg-red-500 rounded-full"></div>
        </div>

        {/* Links */}
        <nav className="flex-1 p-4 space-y-2">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;

            return (
              <Link
                key={link.label}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium tracking-wide transition-all duration-200 group ${
                  isActive
                    ? "bg-red-500 text-white shadow-md font-semibold"
                    : "text-gray-600 hover:bg-red-50 hover:text-red-600"
                }`}
              >
                {Icon && (
                  <Icon
                    className={`w-5 h-5 transition-colors duration-200 ${
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-red-500"
                    }`}
                  />
                )}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar
          userName={user?.name || "User"}
          onLogout={handleLogout}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}