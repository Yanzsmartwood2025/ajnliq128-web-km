import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface SplashCursorProps {
  children: React.ReactNode;
  className?: string;
}

export default function SplashCursor({ children, className = "" }: SplashCursorProps) {
  const [splashes, setSplashes] = useState<{ id: number; x: number; y: number }[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const id = Date.now();
    setSplashes((prev) => [...prev, { id, x, y }]);

    setTimeout(() => {
      setSplashes((prev) => prev.filter((splash) => splash.id !== id));
    }, 1000);
  };

  return (
    <div
      ref={ref}
      onClick={handleClick}
      className={`relative overflow-hidden ${className}`}
    >
      {children}
      {splashes.map((splash) => (
        <motion.div
          key={splash.id}
          className="pointer-events-none absolute z-30 rounded-full border border-white/50 bg-white/20"
          initial={{ opacity: 1, scale: 0, x: "-50%", y: "-50%", left: splash.x, top: splash.y }}
          animate={{ opacity: 0, scale: 4 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ width: 40, height: 40 }}
        />
      ))}
    </div>
  );
}
