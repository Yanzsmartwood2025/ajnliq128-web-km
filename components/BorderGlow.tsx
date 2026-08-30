import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface BorderGlowProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export default function BorderGlow({ children, className = "", glowColor = "#ffffff" }: BorderGlowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative group ${className}`}
    >
      {/* Glow effect */}
      <motion.div
        className="pointer-events-none absolute -inset-0.5 z-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at ${mouseX.get()}px ${mouseY.get()}px, ${glowColor}, transparent 50%)`,
        }}
      />

      {/* Content wrapper to cover the glow in the center */}
      <div className="absolute inset-[2px] z-10 rounded-full bg-black/40 backdrop-blur-sm" />

      {/* Actual content */}
      <div className="relative z-20 h-full w-full">
        {children}
      </div>
    </div>
  );
}
