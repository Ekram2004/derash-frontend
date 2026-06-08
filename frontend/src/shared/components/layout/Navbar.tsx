// src/shared/components/layout/Navbar.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bars3Icon, SunIcon, MoonIcon, XMarkIcon } from "@heroicons/react/24/solid";
import derashLogo from "../../../assets/images.jpg";
import LanguageSwitcher from "@/shared/components/LanguageSwitcher";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  userName?: string;
  role?: string;
  onLogout: () => void;
  onMenuClick?: () => void;
  children?: React.ReactNode;
}

export default function Navbar({ userName, role, onLogout, onMenuClick, children }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on window resize (if screen becomes larger)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileMenuOpen]);

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100"
            : "bg-white shadow-sm border-b border-gray-100"
        } dark:bg-gray-900/95 dark:backdrop-blur-md dark:border-gray-800`}
      >
        <div className="relative flex items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4">
          {/* LEFT SIDE - Menu Button (Mobile) */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                if (onMenuClick) onMenuClick();
              }}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Menu"
            >
              <Bars3Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* LEFT SIDE - Desktop spacer */}
          <div className="hidden md:block w-8 lg:w-10"></div>

          {/* CENTER - Logo and Brand - Responsive */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-1.5 sm:gap-2 md:gap-3 group cursor-pointer"
            >
              {/* Logo Image */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg sm:rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300">
                  <img
                    src={derashLogo}
                    alt="DERASH Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>

              {/* Brand Name */}
              <div className="flex flex-col">
                <motion.h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold bg-gradient-to-r from-red-600 via-gray-700 to-red-600 bg-clip-text text-transparent dark:from-red-400 dark:via-gray-300 dark:to-red-400">
                  DERASH
                </motion.h1>
                <span className="text-[8px] sm:text-[10px] md:text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
                  National Bill Aggregator
                </span>
              </div>
            </motion.div>
          </div>

          {/* RIGHT SIDE - Actions */}
          <div className="flex items-center gap-1 sm:gap-2 ml-auto">
            {/* NEW: Render the children (NotificationBell) here */}
            {children}
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <SunIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
              ) : (
                <MoonIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            {/* Desktop Logout Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onLogout}
              className="hidden sm:flex items-center gap-1.5 md:gap-2 px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-xs sm:text-sm md:text-base font-medium"
            >
              <span>Logout</span>
            </motion.button>

            {/* Mobile Logout Button (Icon only) */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onLogout}
              className="sm:hidden flex items-center justify-center p-1.5 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white rounded-lg transition-all duration-200 shadow-md"
              aria-label="Logout"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Drawer - Slide from left */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50 md:hidden transition-opacity duration-300"
            onClick={() => {
              setMobileMenuOpen(false);
              if (onMenuClick) onMenuClick();
            }}
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-gray-900 shadow-2xl z-50 md:hidden flex flex-col"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg overflow-hidden">
                  <img
                    src={derashLogo}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-bold text-gray-800 dark:text-white">
                  DERASH
                </span>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onMenuClick) onMenuClick();
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 p-4">
              <div className="space-y-4">
                <div className="pb-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Appearance
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setTheme("light")}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                        theme === "light"
                          ? "bg-red-500 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <SunIcon className="w-4 h-4" /> Light
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                        theme === "dark"
                          ? "bg-red-500 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <MoonIcon className="w-4 h-4" /> Dark
                    </button>
                  </div>
                </div>

                <div className="pb-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Language
                    </span>
                  </div>
                  <LanguageSwitcher />
                </div>
              </div>
            </div>

            {/* Drawer Footer - Logout */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white rounded-lg font-medium text-sm transition-all"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </div>
          </motion.div>
        </>
      )}
    </>
  );
}