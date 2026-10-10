import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { appleEase, durations } from "../../motion/transitions";

interface AnimatedSectionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}

export const AnimatedSection = ({
  children,
  delay = 0,
  className,
  id,
  style,
}: AnimatedSectionProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      id={id}
      className={className}
      style={style}
      initial={{
        opacity: 0,
        y: shouldReduceMotion ? 0 : 24,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        margin: "-50px",
      }}
      transition={{
        duration: shouldReduceMotion ? 0.05 : durations.reveal,
        delay: shouldReduceMotion ? 0 : delay,
        ease: appleEase,
      }}
    >
      {children}
    </motion.section>
  );
};

export default AnimatedSection;
