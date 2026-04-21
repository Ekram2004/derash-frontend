import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ChevronDownIcon, ArrowRightOnRectangleIcon, Bars3Icon } from "@heroicons/react/24/solid";
import derashLogo from "../../../assets/images.jpg";

interface Props {
  userName: string;
  role?: "SYSTEM_ADMIN" | "AGENT_USER" | "BILLER_USER" | string;
  onLogout: () => void;
  onMenuClick?: () => void;
}

// Animation Variants
const dropdownVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: { duration: 0.2 },
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

const buttonVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

export default function Navbar({ userName, role, onLogout, onMenuClick }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Convert role to label
  const getRoleLabel = () => {
    switch (role) {
      case "SYSTEM_ADMIN":
        return "Administrator";
      case "AGENT_USER":
        return "Agent";
      case "BILLER_USER":
        return "Biller";
      default:
        return "User";
    }
  };

  // Get role color
  const getRoleColor = () => {
    switch (role) {
      case "SYSTEM_ADMIN":
        return "bg-purple-100 text-purple-700";
      case "AGENT_USER":
        return "bg-blue-100 text-blue-700";
      case "BILLER_USER":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Get initial from name
  const getInitial = () => {
    return userName.charAt(0).toUpperCase();
  };

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
      <div className="relative flex items-center justify-between px-4 sm:px-6 lg:px-8 py-2 md:py-3">
        
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

        {/* LEFT SIDE - Invisible spacer for desktop */}
        <div className="hidden md:block w-auto lg:w-40">
          {/* This empty div balances the layout */}
        </div>

        {/* CENTER - Logo/Brand - PERFECTLY CENTERED */}
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
            
            <div className="flex flex-col">
              <motion.h1 
                className="text-base md:text-lg lg:text-xl font-bold
                 bg-gradient-to-r from-red-500 via-gray-700 to-red-500
                  bg-clip-text text-transparent"
              >
                DERASH
              </motion.h1>
            </div>
          </motion.div>
        </div>

        {/* RIGHT SIDE - Profile Dropdown */}
        <div ref={dropdownRef} className="relative ml-auto">
          <motion.button
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 md:gap-3 bg-white hover:bg-gray-50 px-2 md:px-3 py-1.5 md:py-2 rounded-xl transition-all duration-200 border border-gray-200 hover:border-gray-300 shadow-sm"
          >
            {/* Avatar */}
            <div className="relative">
              <div className="w-7 h-7 md:w-9 md:h-9 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center shadow-inner">
                <span className="text-xs md:text-sm font-bold text-red-600">
                  {getInitial()}
                </span>
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 md:w-2.5 md:h-2.5 ${getRoleColor().split(' ')[0]} rounded-full border-2 border-white`}></div>
            </div>

            {/* User Info - Hidden on small mobile */}
            <div className="text-left hidden sm:block">
              <p className="text-xs md:text-sm font-semibold text-gray-800 leading-tight">
                {userName.length > 15 ? userName.substring(0, 12) + '...' : userName}
              </p>
              <div className="flex items-center gap-1.5">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${getRoleColor().split(' ')[0]}`}></span>
                <p className={`text-xs font-medium ${getRoleColor()}`}>
                  {getRoleLabel()}
                </p>
              </div>
            </div>

            <motion.div
              animate={{ rotate: dropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-gray-400 hidden sm:block"
            >
              <ChevronDownIcon className="w-4 h-4" />
            </motion.div>
          </motion.button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute right-0 mt-2 w-56 md:w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
              >
                {/* User Header */}
                <div className="px-3 md:px-4 py-3 md:py-4 border-b bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-red-100 to-red-50 rounded-xl flex items-center justify-center shadow-sm">
                      <span className="text-base md:text-lg font-bold text-red-600">
                        {getInitial()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs md:text-sm font-bold text-gray-800">
                        {userName}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${getRoleColor().split(' ')[0]}`}></span>
                        <p className={`text-xs font-medium px-2 py-0.5 rounded-full ${getRoleColor()}`}>
                          {getRoleLabel()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role Details */}
                <div className="px-3 md:px-4 py-2 md:py-3 border-b bg-white">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Access Level</span>
                    <span className="font-medium text-gray-700">{getRoleLabel()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-2">
                    <span className="text-gray-500">Session Status</span>
                    <span className="text-green-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                      Active
                    </span>
                  </div>
                </div>

                {/* Logout Action */}
                <div className="py-1">
                  <motion.button
                    whileHover={{ x: 5, backgroundColor: "#fef2f2" }}
                    onClick={onLogout}
                    className="flex items-center gap-3 w-full px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm text-red-600 hover:bg-red-50 transition-all duration-200 group"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    <span className="font-medium">Log out</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
}