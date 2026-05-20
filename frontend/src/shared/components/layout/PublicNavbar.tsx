import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Menu, X } from "lucide-react";
import derashLogo from "../../../assets/images.jpg";

// Animation Variants
const navVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5,
      ease: "easeOut"
    } 
  },
};

const mobileMenuVariants: Variants = {
  hidden: { opacity: 0, height: 0, transition: { duration: 0.3 } },
  visible: { 
    opacity: 1, 
    height: "auto", 
    transition: { 
      duration: 0.4,
      ease: "easeInOut"
    } 
  },
  exit: { 
    opacity: 0, 
    height: 0, 
    transition: { 
      duration: 0.3,
      ease: "easeInOut"
    } 
  },
};

const linkVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({ 
    opacity: 1, 
    x: 0, 
    transition: { 
      delay: i * 0.1,
      duration: 0.3
    } 
  }),
};

export default function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <motion.nav
      initial="hidden"
      animate="visible"
      variants={navVariants}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white/95 backdrop-blur-md shadow-lg" 
          : "bg-white shadow-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          
          {/* Logo with Animation */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2"
          >
            <Link to="/" className="flex items-center gap-2 group">
              {/* Logo Image - Added */}
              <div className="w-8 h-8 rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-all">
                <img 
                  src={derashLogo} 
                  alt="DERASH Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-red-700 via-red-600 to-red-500 bg-clip-text text-transparent tracking-tight">
                DERASH
              </h1>
            </Link>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 lg:gap-10">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.path}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={linkVariants}
              >
                <Link
                  to={link.path}
                  className={`relative font-semibold transition-all duration-300 ${
                    isActive(link.path)
                      ? "text-red-600"
                      : "text-gray-700 hover:text-red-600"
                  }`}
                >
                  <span className="relative py-1">
                    {link.name}
                    {isActive(link.path) && (
                      <motion.span
                        layoutId="activeTab"
                        className="absolute left-0 -bottom-1 w-full h-0.5 bg-gradient-to-r from-red-600 to-red-400 rounded-full"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </span>
                </Link>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/login"
                className="bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:from-red-700 hover:to-red-600"
              >
                Login
              </Link>
            </motion.div>
          </div>

          {/* Mobile Menu Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="md:hidden text-gray-700 hover:text-red-600 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu with Animation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="md:hidden overflow-hidden bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-lg"
          >
            <div className="px-6 py-4 space-y-3">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={link.path}
                    className={`block py-3 font-semibold transition-all duration-300 ${
                      isActive(link.path)
                        ? "text-red-600 border-l-4 border-red-600 pl-3"
                        : "text-gray-700 hover:text-red-600 hover:pl-3"
                    }`}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="pt-2"
              >
                <Link
                  to="/login"
                  className="block bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-3 rounded-xl font-semibold text-center shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Login
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}