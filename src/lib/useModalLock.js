import { useEffect } from "react";

// While `locked`, stop Lenis smooth scrolling and Esc calls onClose.
export default function useModalLock(locked, onClose) {
  useEffect(() => {
    if (!locked) return;
    window.__lenis?.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      window.__lenis?.start();
    };
  }, [locked, onClose]);
}
