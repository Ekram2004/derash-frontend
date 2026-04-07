import { Link, useLocation } from "react-router-dom";
import type { ComponentType, SVGProps } from "react";

interface LinkItem {
  label: string;
  path: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
}

interface Props {
  title: string;
  links: LinkItem[];
}

export default function Sidebar({ title, links }: Props) {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r shadow-sm flex flex-col">
      
      {/* Header */}
      <div className="p-6 border-b">
        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
          {title}
        </h2>
        <div className="mt-2 h-1 w-12 bg-red-500 rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const isActive = location.pathname.startsWith(link.path);
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

      {/* Footer */}
      <div className="p-4 border-t text-xs text-gray-400 text-center">
        © {new Date().getFullYear()} Admin Panel
      </div>
    </aside>
  );
}