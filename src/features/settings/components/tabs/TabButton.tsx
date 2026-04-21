import { motion } from "framer-motion";

export default function TabButton({
  label,
  active,
  onClick,
}: any) {
  return (
    <button
      onClick={onClick}
      className="relative px-6 py-4 text-sm font-semibold"
    >
      {label}

      {active && (
        <motion.div
          layoutId="tab-indicator"
          className="absolute left-0 right-0 bottom-0 h-[2px] bg-red-600"
        />
      )}
    </button>
  );
}