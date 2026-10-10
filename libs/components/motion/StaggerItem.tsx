import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { appleEase, durations } from "../../motion/transitions";

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  distance?: number;
}

export const StaggerItem = ({
  children,
  className,
  style,
  distance = 18,
}: StaggerItemProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          y: shouldReduceMotion ? 0 : distance,
        },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: shouldReduceMotion ? 0.05 : durations.reveal,
            ease: appleEase,
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

export default StaggerItem;
