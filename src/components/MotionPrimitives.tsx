"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

export function Reveal({
  children,
  className,
  delay = 0
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {

  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

export function WordReveal({ text }: { text: string }) {
  const words = text.split(" ");

  return (
    <p className="mx-auto max-w-5xl text-center font-display text-[clamp(2.2rem,5vw,5.9rem)] leading-[0.94] text-paper">
      {words.map((word, index) => (
        <motion.span
          className="mr-[0.22em] inline-block"
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-18% 0px" }}
          transition={{ duration: 0.5, delay: index * 0.035 }}
          key={`${word}-${index}`}
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
}
