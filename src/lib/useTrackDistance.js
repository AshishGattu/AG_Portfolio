import { useEffect, useState } from "react";

// Horizontal distance (px) a sticky track must travel so its last item ends in view
// with `padVw` of right padding. Re-measured on resize / content change.
export function useTrackDistance(trackRef, padVw = 5) {
  const [distance, setDistance] = useState(0);
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => {
      const vw = window.innerWidth;
      setDistance(Math.max(0, el.scrollWidth - vw + (vw * padVw) / 100));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [trackRef, padVw]);
  return distance;
}
