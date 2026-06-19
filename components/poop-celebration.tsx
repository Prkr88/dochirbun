"use client";

import { useMemo } from "react";

interface PoopCelebrationProps {
  trigger: number;
}

export function PoopCelebration({ trigger }: PoopCelebrationProps) {
  const variant = trigger % 3;
  const drops = useMemo(
    () =>
      Array.from({ length: 28 }, (_, index) => ({
        id: index,
        delay: `${(index % 8) * 0.08}s`,
        duration: `${1.6 + (index % 5) * 0.16}s`,
        left: `${(index * 37) % 100}%`,
        rotate: `${index % 2 === 0 ? 1 : -1}`,
        size: `${24 + (index % 4) * 8}px`
      })),
    []
  );

  if (trigger === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {drops.map((drop) => (
        <span
          key={`${trigger}-${drop.id}`}
          className={`absolute ${variant === 2 ? "top-1/2" : "-top-12"} ${
            variant === 0
              ? "animate-[poop-fall_var(--duration)_ease-in_forwards]"
              : variant === 1
                ? "animate-[poop-sway-fall_var(--duration)_ease-in-out_forwards]"
                : "animate-[poop-burst-fall_var(--duration)_ease-out_forwards]"
          }`}
          style={{
            "--duration": drop.duration,
            "--rotate-direction": drop.rotate,
            animationDelay: drop.delay,
            fontSize: drop.size,
            left: drop.left
          } as React.CSSProperties}
        >
          💩
        </span>
      ))}
    </div>
  );
}
