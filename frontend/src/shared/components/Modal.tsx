// src/shared/components/Modal.tsx
import type { ReactNode } from "react";
import { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface Props {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-[95%] md:max-w-3xl",
};

export default function Modal({ 
  isOpen, 
  title, 
  children, 
  onClose,
  maxWidth = "lg"
}: Props) {
  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className={`w-full ${maxWidthClasses[maxWidth]} mx-auto bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 animate-fadeIn max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b bg-gray-50 flex-shrink-0">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
            {title}
          </h2>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 sm:p-2 rounded-full text-gray-500 hover:text-white hover:bg-red-500 transition-all duration-200 flex-shrink-0"
          >
            <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 overflow-y-auto flex-1">
          {children}
        </div>
      </div>

      {/* Animation Style */}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.2s ease-out;
          }
        `}
      </style>
    </div>
  );
}