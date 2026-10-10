import { Variants, Transition } from "framer-motion";

/**
 * Apple-inspired animation constants and easing curves.
 * Fluid, refined, restrained — zero tacky bounces.
 */

// Silky smooth Apple ease-out curve (similar to iOS spring deceleration curve)
export const appleEase = [0.16, 1, 0.3, 1] as const;

// Microinteraction easing for fast feedback (buttons, badges, icons)
export const microEase = [0.25, 0.1, 0.25, 1.0] as const;

export const durations = {
  micro: 0.2, // 200ms
  card: 0.28, // 280ms
  reveal: 0.55, // 550ms
  modal: 0.3, // 300ms
  stagger: 0.07, // 70ms interval
};

export const defaultTransition: Transition = {
  duration: durations.reveal,
  ease: appleEase,
};

export const fadeInVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: (custom?: { delay?: number; duration?: number }) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: custom?.duration ?? durations.reveal,
      delay: custom?.delay ?? 0,
      ease: appleEase,
    },
  }),
};

export const fadeInOnlyVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: (custom?: { delay?: number }) => ({
    opacity: 1,
    transition: {
      duration: durations.reveal,
      delay: custom?.delay ?? 0,
      ease: appleEase,
    },
  }),
};

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: durations.stagger,
      delayChildren: 0.05,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.reveal,
      ease: appleEase,
    },
  },
};

export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: durations.micro, ease: microEase },
  },
  exit: {
    opacity: 0,
    transition: { duration: durations.micro, ease: microEase },
  },
};

export const modalDialogVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: 12,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: durations.modal,
      ease: appleEase,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 8,
    transition: {
      duration: durations.micro,
      ease: microEase,
    },
  },
};
