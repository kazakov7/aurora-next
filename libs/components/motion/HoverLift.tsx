import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { appleEase, durations } from "../../motion/transitions";

interface HoverLiftProps {
  children: React.ReactNode;
  y?: number;
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export const HoverLift = ({
  children,
  y = -4,
  scale = 1.01,
  className,
  style,
  onClick,
}: HoverLiftProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              y,
              scale,
              transition: {
                duration: durations.card,
                ease: appleEase,
              },
            }
      }
      whileTap={
        shouldReduceMotion
          ? undefined
          : {
              scale: 0.99,
              transition: {
                duration: durations.micro,
                ease: appleEase,
              },
            }
      }
      className={className}
      style={{
        transformOrigin: "center center",
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default HoverLift;
