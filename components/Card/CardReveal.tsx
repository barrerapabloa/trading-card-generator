"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createTimeline } from "animejs";
import type { CardData } from "@/types/card";

type Props = {
  card: CardData | null;
  children: ReactNode;
};

export function CardReveal({ card, children }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const key = card?.id ?? "none";

  useEffect(() => {
    if (!card) return;
    const el = wrapRef.current;
    if (!el) return;

    el.style.opacity = "0";
    el.style.transform = "translateY(72px) scale(0.82) rotateY(90deg)";

    const tl = createTimeline({ defaults: { ease: "out(4)" } });
    tl.add(el, {
      translateY: [72, 0],
      scale: [0.82, 1],
      opacity: [0, 1],
      rotateY: [90, 0],
      duration: 700,
    });

    return () => {
      tl.pause();
    };
  }, [key, card]);

  if (!card) return null;

  return (
    <div ref={wrapRef} style={{ perspective: "1000px", transformStyle: "preserve-3d" }}>
      {children}
    </div>
  );
}
