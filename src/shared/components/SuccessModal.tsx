// src/shared/components/SuccessModal.tsx
import { useEffect, useState } from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";


interface Props {
  isOpen: boolean;
  message: string;
  onClose: () => void;
  duration?: number;
  type?: "success" | "error";
  title?: string;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    }
  },
  exit: { opacity: 0, scale: 0.9, y: -20 },
};

const iconVariants = {
  hidden: { scale: 0 },
  animate: { 
    scale: 1,
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

export default function SuccessModal({
  isOpen,
  message,
  onClose,
  duration = 2000,
  type = "success",
  title,
}: Props) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isOpen) {
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
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const isError = type === "error";
  const IconComponent = isError ? XCircleIcon : CheckCircleIcon;
  const bgColor = isError ? "bg-red-50" : "bg-green-50";
  const borderColor = isError ? "border-red-200" : "border-green-200";
  const iconBg = isError ? "bg-red-100" : "bg-green-100";
  const iconColor = isError ? "text-red-600" : "text-green-600";
  const titleColor = isError ? "text-red-800" : "text-green-800";
  const messageColor = isError ? "text-red-600" : "text-green-600";
  const progressColor = isError ? "bg-red-500" : "bg-green-500";
  const buttonColor = isError ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700";
  const modalTitle = title || (isError ? "Error" : "Success");

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="animate"
            exit="exit"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="animate"
            exit="exit"
            className={`
              relative w-full max-w-sm md:max-w-md 
              ${bgColor} border ${borderColor}
              rounded-2xl shadow-2xl overflow-hidden
            `}
          >
            {/* Progress Bar */}
            {!isError && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
                <motion.div
                  className={`h-full ${progressColor}`}
                  variants={progressVariants}
                  initial="initial"
                  animate="animate"
                  custom={progress}
                />
              </div>
            )}

            {/* Content */}
            <div className="p-6 md:p-8 text-center">
              {/* Icon */}
              <motion.div
                variants={iconVariants}
                initial="hidden"
                animate="animate"
                className={`flex justify-center mb-5`}
              >
                <div className={`${iconBg} p-4 rounded-full shadow-inner`}>
                  <IconComponent className={`w-12 h-12 md:w-14 md:h-14 ${iconColor}`} />
                </div>
              </motion.div>

              {/* Title */}
              <h2 className={`text-xl md:text-2xl font-bold ${titleColor} mb-2`}>
                {modalTitle}
              </h2>

              {/* Message */}
              <p className={`text-sm md:text-base ${messageColor} leading-relaxed`}>
                {message}
              </p>

              {/* Button */}
              <button
                onClick={onClose}
                className={`mt-6 w-full px-4 py-2 rounded-lg font-medium text-sm transition-colors text-white ${buttonColor}`}
              >
                {isError ? "Close" : "Got it"}
              </button>

              {/* Auto-close hint */}
              {!isError && (
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