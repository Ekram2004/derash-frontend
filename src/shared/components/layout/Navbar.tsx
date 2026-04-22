// src/shared/components/layout/Navbar.tsx

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bars3Icon } from "@heroicons/react/24/solid";
import derashLogo from "../../../assets/images.jpg";

interface Props {
  userName?: string;
  role?: string;
  onLogout: () => void;
  onMenuClick?: () => void;
}

export default function Navbar({ onLogout, onMenuClick }: Props) {
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100"
          : "bg-white shadow-sm border-b border-gray-100"
      }`}
    >
      <div className="relative flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 md:py-4">
        
        {/* LEFT SIDE - Menu Button (Mobile) */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Menu"
          >
            <Bars3Icon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* LEFT SIDE - Invisible spacer for desktop balance */}
        <div className="hidden md:block w-10"></div>

        {/* CENTER - Logo and Brand */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 md:gap-3 group cursor-pointer"
          >
            {/* Logo Image */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300">
                <img 
                  src={derashLogo} 
                  alt="DERASH Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
            
            {/* Brand Name */}
            <div className="flex flex-col">
              <motion.h1 
                className="text-base md:text-lg lg:text-xl font-bold bg-gradient-to-r from-red-600 via-gray-700 to-red-600 bg-clip-text text-transparent"
              >
                DERASH
              </motion.h1>
              <span className="text-[10px] md:text-xs text-gray-400 hidden sm:block">
                National Bill Aggregator
              </span>
            </div>
          </motion.div>
        </div>

        {/* RIGHT SIDE - Logout Button Only */}
        <div className="ml-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLogout}
            className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-sm md:text-base font-medium"
          >
            
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">Exit</span>
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}