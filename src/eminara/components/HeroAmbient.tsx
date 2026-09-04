import { motion, useReducedMotion } from "framer-motion";

const ORBS = [
  { size: 560, x: "18%", y: "12%", color: "var(--color-accent)", opacity: 0.05, duration: 14, delay: 0 },
  { size: 420, x: "72%", y: "28%", color: "var(--color-cream)", opacity: 0.03, duration: 18, delay: 2.5 },
  { size: 320, x: "55%", y: "55%", color: "var(--color-accent)", opacity: 0.04, duration: 16, delay: 1.2 },
];

const PARTICLES = [
  { x: "22%", y: "18%", size: 3, duration: 9, delay: 0 },
  { x: "78%", y: "24%", size: 2, duration: 12, delay: 1.5 },
  { x: "64%", y: "62%", size: 4, duration: 10, delay: 0.8 },
  { x: "35%", y: "74%", size: 2, duration: 14, delay: 2.2 },
  { x: "88%", y: "46%", size: 3, duration: 11, delay: 3.1 },
  { x: "12%", y: "52%", size: 2, duration: 13, delay: 1.9 },
];

export default function HeroAmbient() {
  const reduce = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Drifting gradient orbs */}
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-[120px]"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            backgroundColor: orb.color,
            opacity: reduce ? orb.opacity : orb.opacity * 0.7,
          }}
          animate={
            reduce
              ? {}
              : {
                  x: ["-8%", "6%", "-8%"],
                  y: ["-6%", "8%", "-6%"],
                  scale: [1, 1.08, 1],
                }
          }
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: orb.delay,
          }}
        />
      ))}

      {/* Floating particles */}
      {PARTICLES.map((p, i) => (
        <motion.span
          key={`p-${i}`}
          className="absolute rounded-full bg-cream-dim/25 shadow-[0_0_12px_var(--color-cream-dim)]"
          style={{
            width: p.size,
            height: p.size,
            left: p.x,
            top: p.y,
          }}
          animate={
            reduce
              ? {}
              : {
                  y: [0, -18, 0],
                  opacity: [0.25, 0.55, 0.25],
                }
          }
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}

      {/* Subtle connecting lines SVG */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--color-cream-dim)" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <motion.path
          d="M260 140 Q 540 280 820 180 T 1340 260"
          fill="none"
          stroke="url(#line-grad)"
          strokeWidth="1"
          animate={reduce ? {} : { pathLength: [0.4, 1, 0.4], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M180 420 Q 460 320 740 440 T 1180 380"
          fill="none"
          stroke="url(#line-grad)"
          strokeWidth="1"
          animate={reduce ? {} : { pathLength: [0.3, 0.9, 0.3], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />
      </svg>
    </div>
  );
}
