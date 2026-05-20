// src/shared/components/layout/DashboardLayout.tsx (Updated)

import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useAuthStore } from "@/features/auth/store/auth.store";
import Navbar from "@/shared/components/layout/Navbar";
import Sidebar from "@/shared/components/layout/Sidebar";

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

// Animation Variants
const contentVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: 8, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } },
};

const pageTransitionVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2, staggerChildren: 0.05 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

// Scroll to Top Button Component
function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const mainContent = document.querySelector("main");
    if (!mainContent) return;

    const toggleVisibility = () => setIsVisible(mainContent.scrollTop > 400);
    mainContent.addEventListener("scroll", toggleVisibility);
    return () => mainContent.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    const mainContent = document.querySelector("main");
    mainContent?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-10 h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 flex items-center justify-center group"
          aria-label="Scroll to top"
        >
          <svg className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default function DashboardLayout({ title, links, children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileSidebarOpen(false);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (mobileSidebarOpen) setMobileSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-300 dark:text-gray-700" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Sidebar */}
      <Sidebar 
        title={title} 
        links={links} 
        isMobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        
        {/* Navbar */}
        <Navbar
          userName={user?.name || "User"}
          role={user?.role}
          onLogout={handleLogout}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        {/* Page Content */}
        <motion.main
          variants={pageTransitionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex-1 overflow-y-auto overflow-x-hidden"
        >
          <div className="h-full p-4 md:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                variants={contentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.main>
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
}