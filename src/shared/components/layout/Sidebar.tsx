import { Link, useLocation } from "react-router-dom";
import type { ComponentType, SVGProps } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface LinkItem {
  label: string;
  path: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
}

interface Props {
  title: string;
  links: LinkItem[];
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ title, links, isMobileOpen, onMobileClose }: Props) {
  const location = useLocation();

  const isLinkActive = (linkPath: string) => {
    const currentPath = location.pathname;
    
    // For Dashboard - exact match only (not /admin/*)
    if (linkPath === "/admin") {
      return currentPath === "/admin";
    }
    
    // For other links - check if current path starts with the link path
    // This ensures /admin/billers matches Billers, /admin/agents matches Agents, etc.
    return currentPath.startsWith(linkPath);
  };

  const SidebarContent = () => (
    <>
      {/* Header with close button for mobile */}
      <div className="p-4 md:p-6 border-b flex items-center justify-between">
        <div>
          <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-red-500 via-gray-700 to-red-500 bg-clip-text text-transparent">
            {title}
          </h2>
          
        </div>
        {/* Mobile close button */}
        {onMobileClose && (
          <button 
            onClick={onMobileClose}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 md:p-4 space-y-1 md:space-y-2 overflow-y-auto">
        {links.map((link) => {
          const isActive = isLinkActive(link.path);
          const Icon = link.icon;

          return (
            <Link
              key={link.label}
              to={link.path}
              onClick={onMobileClose}
              className={`flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-medium tracking-wide transition-all duration-200 group ${
                isActive
                  ? "bg-red-500 text-white shadow-md font-semibold"
                  : "text-black-800 hover:bg-red-50 hover:text-red-600"
              }`}
            >
              {Icon && (
                <Icon
                  className={`w-4 h-4 md:w-5 md:h-5 transition-colors duration-200 ${
                    isActive
                      ? "text-white"
                      : "text-gray-400 group-hover:text-red-500"
                  }`}
                />
              )}
              <span className="flex-1 text-left">{link.label}</span>
              
              {/* Active Indicator */}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      
    </>
  );

  return (
    <>
      {/* Desktop Sidebar - Always visible */}
      <aside className="hidden md:block w-64 bg-white border-r shadow-sm flex flex-col h-full overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar - Overlay */}
      {isMobileOpen && onMobileClose && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onMobileClose}
          />
          <aside className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-2xl z-50 md:hidden flex flex-col overflow-y-auto">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}