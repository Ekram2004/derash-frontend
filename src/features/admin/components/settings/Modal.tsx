// src/features/admin/components/settings/Modal.tsx

import { motion } from "framer-motion";

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}

export default function Modal({ children, onClose, title }: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl max-w-md w-full shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-5">
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
        <div className="p-5">{children}</div>
      </motion.div>
    </div>
  );
}