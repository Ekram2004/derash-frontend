// src/shared/components/NotificationModal.tsx
import { useEffect, useState } from "react";
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  isOpen: boolean;
  message: string;
  type?: "success" | "error" | "warning" | "info";
  onClose: () => void;
  duration?: number;
  title?: string;
  showProgress?: boolean;
  onRetry?: () => void;
  details?: string;
}

const config = {
  success: {
    icon: CheckCircleIcon,
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    titleColor: "text-green-800",
    messageColor: "text-green-600",
    progressColor: "bg-green-500",
    defaultTitle: "Success",
    buttonColor: "bg-green-600 hover:bg-green-700",
  },
  error: {
    icon: XCircleIcon,
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    titleColor: "text-red-800",
    messageColor: "text-red-600",
    progressColor: "bg-red-500",
    defaultTitle: "Error",
    buttonColor: "bg-red-600 hover:bg-red-700",
  },
  warning: {
    icon: ExclamationTriangleIcon,
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    titleColor: "text-yellow-800",
    messageColor: "text-yellow-600",
    progressColor: "bg-yellow-500",
    defaultTitle: "Warning",
    buttonColor: "bg-yellow-600 hover:bg-yellow-700",
  },
  info: {
    icon: InformationCircleIcon,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    titleColor: "text-blue-800",
    messageColor: "text-blue-600",
    progressColor: "bg-blue-500",
    defaultTitle: "Information",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
  },
};

// Animation variants - Fixed version
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.9,
    y: 20
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      duration: 0.3
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9,
    y: -20,
    transition: {
      duration: 0.2
    }
  },
};

const iconVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: { 
    scale: 1, 
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15,
      delay: 0.1
    }
  },
};

const progressVariants = {
  initial: { width: "100%" },
  animate: (progress: number) => ({
    width: `${progress}%`,
    transition: { duration: 0.016 }
  }),
};

export default function NotificationModal({
  isOpen,
  message,
  type = "success",
  onClose,
  duration = 3000,
  title,
  showProgress = true,
  onRetry,
  details,
}: Props) {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const currentConfig = config[type];
  const IconComponent = currentConfig.icon;

  // Auto-close timer with progress
  useEffect(() => {
    if (isOpen && !isPaused && type !== "error") {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, ((duration - elapsed) / duration) * 100);
        setProgress(remaining);
        
        if (elapsed >= duration) {
          clearInterval(interval);
          onClose();
        }
      }, 16);
      
      return () => clearInterval(interval);
    } else if (type === "error") {
      setProgress(0);
    }
  }, [isOpen, duration, onClose, isPaused, type]);

  // Reset progress when modal opens
  useEffect(() => {
    if (isOpen) {
      setProgress(100);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`
              relative w-full max-w-sm md:max-w-md 
              ${currentConfig.bgColor} 
              border ${currentConfig.borderColor}
              rounded-2xl shadow-2xl 
              overflow-hidden
              transform transition-all
            `}
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-title"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Progress Bar */}
            {showProgress && type !== "error" && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
                <motion.div
                  className={`h-full ${currentConfig.progressColor}`}
                  variants={progressVariants}
                  initial="initial"
                  animate="animate"
                  custom={progress}
                />
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
              aria-label="Close"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="p-6 md:p-8 text-center">
              {/* Icon */}
              <motion.div
                variants={iconVariants}
                initial="hidden"
                animate="visible"
                className={`flex justify-center mb-5`}
              >
                <div className={`${currentConfig.iconBg} p-4 rounded-full shadow-inner`}>
                  <IconComponent className={`w-12 h-12 md:w-14 md:h-14 ${currentConfig.iconColor}`} />
                </div>
              </motion.div>

              {/* Title */}
              <h2 
                id="notification-title"
                className={`text-xl md:text-2xl font-bold ${currentConfig.titleColor} mb-2`}
              >
                {title || currentConfig.defaultTitle}
              </h2>

              {/* Message */}
              <p className={`text-sm md:text-base ${currentConfig.messageColor} leading-relaxed mb-4`}>
                {message}
              </p>

              {/* Details (for errors) */}
              {details && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-3 p-3 bg-white/50 rounded-lg"
                >
                  <p className="text-xs text-gray-600 font-mono break-all">
                    {details}
                  </p>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 space-y-2">
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                  >
                    Try Again
                  </button>
                )}
                
                <button
                  onClick={onClose}
                  className={`w-full px-4 py-2 rounded-lg font-medium text-sm transition-colors text-white ${currentConfig.buttonColor}`}
                >
                  {type === "error" ? "Close" : "Got it"}
                </button>
              </div>

              {/* Auto-close hint */}
              {type !== "error" && showProgress && (
                <p className="text-xs text-gray-400 mt-4">
                  This will close automatically in {(progress / 100 * duration / 1000).toFixed(1)}s
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}