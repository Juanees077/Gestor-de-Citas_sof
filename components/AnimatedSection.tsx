"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  animation?: "fade-up" | "fade-left" | "fade-right" | "scale";
  delay?: 0 | 1 | 2 | 3 | 4 | 5;
  as?: keyof JSX.IntrinsicElements;
}

export default function AnimatedSection({
  children,
  className,
  animation = "fade-up",
  delay = 0,
  as: Tag = "div",
}: AnimatedSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const animClass = {
    "fade-up": "anim-fade-up",
    "fade-left": "anim-fade-left",
    "fade-right": "anim-fade-right",
    "scale": "anim-scale",
  }[animation];

  const delayClass = delay > 0 ? `anim-delay-${delay}` : "";

  return (
    // @ts-expect-error dynamic tag
    <Tag
      ref={ref}
      className={cn("animate-on-scroll", animClass, delayClass, visible && "is-visible", className)}
    >
      {children}
    </Tag>
  );
}
