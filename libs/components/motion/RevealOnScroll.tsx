import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { appleEase, durations } from "../../motion/transitions";

interface RevealOnScrollProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "none";
  distance?: number;
  className?: string;
  style?: React.CSSProperties;
  once?: boolean;
}

export const RevealOnScroll = ({
  children,
  delay = 0,
  duration = durations.reveal,
  direction = "up",
  distance = 20,
  className,
  style,
  once = true,
}: RevealOnScrollProps) => {
  const shouldReduceMotion = useReducedMotion();

  const getYOffset = () => {
    if (shouldReduceMotion || direction === "none") return 0;
    return direction === "up" ? distance : -distance;
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: getYOffset(),
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once,
        margin: "-40px",
      }}
      transition={{
        duration: shouldReduceMotion ? 0.05 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: appleEase,
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

export default RevealOnScroll;
