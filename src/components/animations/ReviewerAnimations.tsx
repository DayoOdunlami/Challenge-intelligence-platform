"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

// ============================================
// REUSABLE ANIMATION VARIANTS
// ============================================
export const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 }
};

export const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 }
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0 }
};

export const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0 }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  }
};

// ============================================
// ANIMATED SECTION WRAPPER COMPONENT
// ============================================
interface AnimatedSectionProps {
  children: React.ReactNode;
  variant?: "fadeInUp" | "fadeInScale" | "slideInLeft" | "slideInRight";
  className?: string;
  id?: string;
  delay?: number;
}

export function AnimatedSection({ 
  children, 
  variant = "fadeInUp", 
  className = "",
  id,
  delay = 0
}: AnimatedSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const variants = {
    fadeInUp,
    fadeInScale,
    slideInLeft,
    slideInRight
  };

  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants[variant]}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// ============================================
// STAGGERED LIST COMPONENT
// ============================================
interface StaggeredListProps {
  children: React.ReactNode;
  className?: string;
}

export function StaggeredList({ children, className = "" }: StaggeredListProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggeredItem({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode; 
  className?: string 
}) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

// ============================================
// STICKY REVEAL COMPONENT
// ============================================
interface StickyRevealProps {
  children: React.ReactNode;
  className?: string;
}

export function StickyReveal({ children, className = "" }: StickyRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: false, margin: "-200px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// SCROLL PROGRESS INDICATOR
// ============================================
export function ScrollProgress() {
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-cpc-green-600 to-cpc-green-400 origin-left z-50"
      style={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: false, amount: "all" }}
      transition={{ duration: 0.3 }}
    />
  );
}