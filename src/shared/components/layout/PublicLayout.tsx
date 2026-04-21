// src/components/layout/PublicLayout.tsx
import { motion, AnimatePresence,type Variants } from "framer-motion";
import { useEffect, useState } from "react";
import PublicNavbar from "./PublicNavbar";
import Footer from "./Footer";

// Animation Variants for page transitions
const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      ease: [0.25, 0.1, 0.25, 1], // Custom easing for smooth animation
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 1,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const contentVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 1,
      delayChildren: 1,
    },
  },
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate page load for smooth entrance
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-gray-50 to-white relative overflow-x-hidden">
      
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-100 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-100 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-50 rounded-full filter blur-3xl opacity-10"></div>
        
        {/* Grid Pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-red-400/10 animate-float"
              style={{
                width: Math.random() * 300 + 50 + "px",
                height: Math.random() * 300 + 50 + "px",
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
                animationDelay: Math.random() * 5 + "s",
                animationDuration: Math.random() * 10 + 10 + "s",
              }}
            />
          ))}
        </div>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-white animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div className="flex gap-1 justify-center">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.6,
                      delay: i * 0.1,
                    }}
                    className="w-2 h-2 bg-red-600 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <PublicNavbar />
      
      <motion.main
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        className="flex-1 relative z-10"
      >
        <motion.div variants={contentVariants} className="min-h-full">
          {children}
        </motion.div>
      </motion.main>
      
      <Footer />

      {/* Scroll to Top Button */}
      <ScrollToTop />

      {/* Custom Cursor (Optional - can be removed if not needed) */}
      {/* <CustomCursor /> */}
    </div>
  );
}

// Scroll to Top Component
function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 500);
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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
          className="fixed bottom-8 right-8 z-40 w-12 h-12 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        >
          <svg
            className="w-5 h-5 group-hover:-translate-y-1 transition-transform"
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

// Optional: Custom Cursor Component (uncomment to use)
// function CustomCursor() {
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
//   const [isHovering, setIsHovering] = useState(false);

//   useEffect(() => {
//     const updateMousePosition = (e: MouseEvent) => {
//       setMousePosition({ x: e.clientX, y: e.clientY });
//     };

//     const handleMouseEnter = () => setIsHovering(true);
//     const handleMouseLeave = () => setIsHovering(false);

//     window.addEventListener("mousemove", updateMousePosition);
    
//     const interactiveElements = document.querySelectorAll("a, button, input, [role='button']");
//     interactiveElements.forEach(el => {
//       el.addEventListener("mouseenter", handleMouseEnter);
//       el.addEventListener("mouseleave", handleMouseLeave);
//     });

//     return () => {
//       window.removeEventListener("mousemove", updateMousePosition);
//       interactiveElements.forEach(el => {
//         el.removeEventListener("mouseenter", handleMouseEnter);
//         el.removeEventListener("mouseleave", handleMouseLeave);
//       });
//     };
//   }, []);

//   return (
//     <motion.div
//       animate={{
//         x: mousePosition.x - 12,
//         y: mousePosition.y - 12,
//         scale: isHovering ? 1.5 : 1,
//       }}
//       transition={{ type: "spring", stiffness: 500, damping: 28 }}
//       className="fixed top-0 left-0 w-6 h-6 bg-red-600 rounded-full pointer-events-none z-50 mix-blend-difference hidden lg:block"
//     />
//   );
// }