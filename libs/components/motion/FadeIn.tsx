import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { appleEase, durations } from "../../motion/transitions";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "none";
  distance?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const FadeIn = ({
  children,
  delay = 0,
  duration = durations.reveal,
  direction = "up",
  distance = 16,
  className,
  style,
}: FadeInProps) => {
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
      animate={{
        opacity: 1,
        y: 0,
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

export default FadeIn;
