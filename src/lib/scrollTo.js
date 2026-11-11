// Shared smooth-scroll helper. App.jsx exposes the Lenis instance as window.__lenis.
export function scrollToSection(id) {
  const el = typeof id === "string" ? document.getElementById(id.replace(/^#/, "")) : id;
  if (!el) return;
  if (window.__lenis) {
    window.__lenis.scrollTo(el, { offset: 0 });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export const RESUME_URL = "/Ashish_Gattu_Resume_2026.pdf";

// Anything can open the command palette by dispatching this event.
export const OPEN_PALETTE_EVENT = "open-command-palette";
export const openCommandPalette = () => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT));
