import { useEffect } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

interface Props {
  isOpen: boolean;
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function SuccessModal({
  isOpen,
  message,
  onClose,
  duration = 2000,
}: Props) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, duration]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 w-full max-w-sm text-center animate-modalPop">

        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="bg-green-100 p-4 rounded-full shadow-inner">
            <CheckCircleIcon className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Success
        </h2>

        {/* Message */}
        <p className="text-sm text-gray-500 leading-relaxed">
          {message}
        </p>

        {/* Optional subtle divider */}
        <div className="mt-6 h-px bg-gray-100"></div>

        {/* Footer hint */}
        <p className="text-xs text-gray-400 mt-4">
          This will close automatically
        </p>
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes modalPop {
            0% {
              opacity: 0;
              transform: scale(0.85) translateY(20px);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          .animate-modalPop {
            animation: modalPop 0.3s ease-out;
          }

          .animate-fadeIn {
            animation: fadeIn 0.2s ease-out;
          }
        `}
      </style>
    </div>
  );
}