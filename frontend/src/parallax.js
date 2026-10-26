import { useEffect } from "react";

// Smoothly eases window scroll into a CSS variable (--scroll).
// Any element with class "parallax" and a --speed value drifts with it.
// Calm Mode / reduced motion neutralise the transform in CSS.
export function useParallaxEngine() {
  useEffect(() => {
    const root = document.documentElement;
    let target = window.scrollY;
    let current = target;
    let raf = null;

    const loop = () => {
      current += (target - current) * 0.08;
      if (Math.abs(target - current) < 0.1) {
        current = target;
        raf = null;
      } else {
        raf = requestAnimationFrame(loop);
      }
      root.style.setProperty("--scroll", current.toFixed(1));
    };
    const onScroll = () => {
      target = window.scrollY;
      if (!raf) raf = requestAnimationFrame(loop);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
}
