import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { appleEase, durations } from "../../motion/transitions";

interface StaggerContainerProps {
  children: React.ReactNode;
  staggerInterval?: number;
  delayChildren?: number;
  className?: string;
  style?: React.CSSProperties;
  once?: boolean;
}

export const StaggerContainer = ({
  children,
  staggerInterval = durations.stagger,
  delayChildren = 0.05,
  className,
  style,
  once = true,
}: StaggerContainerProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-40px" }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: shouldReduceMotion ? 0 : staggerInterval,
            delayChildren: shouldReduceMotion ? 0 : delayChildren,
          },
        },
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

export default StaggerContainer;
