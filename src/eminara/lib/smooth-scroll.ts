import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Initialises Lenis smooth scrolling.
 * Respects prefers-reduced-motion so users who prefer reduced motion
 * get native scrolling without any smoothing.
 */
export function useLenis() {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
      wheelMultiplier: 1,
      // Keep the scrollable height in sync as fonts/content load in,
      // otherwise anchor scrolls near the bottom clamp too early.
      autoResize: true,
    });
    // Expose for programmatic smooth scrolling from scrollToId
    (document as any).__lenis = lenis;

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      delete (document as any).__lenis;
      lenis.destroy();
    };
  }, []);
}

/** Smooth-scroll to an element id from anywhere (e.g. button handlers). */
export function scrollToId(id: string) {
  const target = document.querySelector(id);
  if (!target) return;
  // Sections have large vertical padding; when a section marks an inner
  // content anchor, scroll to that so the headline lands near the top
  // instead of leaving a big empty gap under the navbar.
  const el = (target.querySelector("[data-scroll-anchor]") as HTMLElement | null) ?? target;
  const lenis = (document as any).__lenis;
  if (lenis) {
    // Recalculate the scroll limit first: images/fonts may have changed the
    // page height after init, and force lets us reach targets near the end.
    lenis.resize();
    lenis.scrollTo(el as HTMLElement, { offset: -96, force: true });
  } else {
    (el as HTMLElement).scrollIntoView({ behavior: "smooth" });
  }
}
