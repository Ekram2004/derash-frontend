import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useAuthStore } from "@/features/auth/store/auth.store";
import Navbar from "@/shared/components/layout/Navbar";
import Sidebar from "@/shared/components/layout/Sidebar";
import PasswordAlert from "@/shared/components/common/PasswordAlert";

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
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
};

const pageTransitionVariants: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
  exit: { opacity: 0, x: 20, transition: { duration: 0.3 } },
};

// Scroll to Top Component
function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      const mainContent = document.querySelector("main");
      if (mainContent) {
        setIsVisible(mainContent.scrollTop > 300);
      }
    };

    const mainContent = document.querySelector("main");
    if (mainContent) {
      mainContent.addEventListener("scroll", toggleVisibility);
      return () => mainContent.removeEventListener("scroll", toggleVisibility);
    }
  }, []);

  const scrollToTop = () => {
    const mainContent = document.querySelector("main");
    if (mainContent) {
      mainContent.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed bottom-4 md:bottom-8 right-4 md:right-8 z-50 w-9 h-9 md:w-11 md:h-11 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          aria-label="Scroll to top"
        >
          <svg
            className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-y-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
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
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileSidebarOpen(false);
      }
    };
    
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-100 rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-100 rounded-full filter blur-3xl opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-50 rounded-full filter blur-3xl opacity-5"></div>
        
        {/* Grid Pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="dashboard-grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dashboard-grid)" />
        </svg>
      </div>

      {/* Sidebar - Responsive */}
      <Sidebar 
        title={title} 
        links={links} 
        isMobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex-1 flex flex-col overflow-hidden relative z-10"
      >
        {/* Navbar with menu click handler */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Navbar
            userName={user?.name || "User"}
            role={user?.role}
            onLogout={handleLogout}
            onMenuClick={() => setMobileSidebarOpen(true)}
          />
        </motion.div>

        {/* Password Alert */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PasswordAlert />
          </motion.div>
        </AnimatePresence>

        {/* Page Content */}
        <motion.main
          variants={pageTransitionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex-1 overflow-y-auto overflow-x-hidden"
        >
          <div className="h-full p-3 md:p-4 lg:p-6 xl:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                variants={contentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="h-full"
              >
                {/* Children Content */}
                <motion.div
                  variants={pageTransitionVariants}
                  className="space-y-3 md:space-y-4"
                >
                  {children}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.main>
      </motion.div>

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
}