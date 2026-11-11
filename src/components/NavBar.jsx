import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { FaBars, FaTimes, FaGithub, FaLinkedin, FaDownload } from "react-icons/fa";
import { scrollToSection, RESUME_URL, openCommandPalette } from "../lib/scrollTo";

const menuItems = [
  { title: "Home", id: "hero" },
  { title: "About", id: "about" },
  { title: "Projects", id: "projects" },
  { title: "Experience", id: "experience" },
  { title: "Case Study", id: "case-study" },
  { title: "Skills", id: "skills" },
  { title: "Education", id: "education" },
  { title: "Activities", id: "activities" },
  { title: "Contact", id: "contact" },
];

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { scrollYProgress } = useScroll();

  const toggleMenu = () => setIsOpen((o) => !o);

  // Close on Escape + lock body scroll while the overlay is open
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.__lenis?.stop();
    return () => {
      window.__lenis?.start();
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const go = (e, id) => {
    e.preventDefault();
    setIsOpen(false);
    // let the body scroll lock release before scrolling
    setTimeout(() => scrollToSection(id), 60);
  };

  return (
    <>
      {/* Scroll progress bar */}
      <motion.div
        style={{ scaleX: scrollYProgress }}
        className="fixed top-0 left-0 right-0 h-[3px] bg-[#ccff00] origin-left z-[60] pointer-events-none"
      />

      {/* Floating Menu Button */}
      <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50">
        <button
          onClick={toggleMenu}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          className="p-4 bg-black/60 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-[#ccff00] hover:text-black transition-all duration-300"
        >
          {isOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
        </button>
      </div>

      {/* Fullscreen Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            data-lenis-prevent
            className="fixed inset-0 bg-black/95 z-40 overflow-y-auto"
          >
            <div className="min-h-full flex flex-col justify-center items-center py-24 gap-8">
              <nav className="flex flex-col gap-4 md:gap-5 text-center">
                {menuItems.map((item, index) => (
                  <motion.a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => go(e, item.id)}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.06 }}
                    className="text-3xl md:text-5xl font-bold text-transparent hover:text-[#ccff00] transition-colors stroke-text cursor-pointer"
                    style={{ WebkitTextStroke: "1px white" }}
                  >
                    {item.title}
                  </motion.a>
                ))}
              </nav>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col items-center gap-5"
              >
                <a
                  href={RESUME_URL}
                  download
                  className="inline-flex items-center gap-2 border border-[#ccff00] text-[#ccff00] px-6 py-2.5 rounded-full font-mono text-xs uppercase tracking-widest hover:bg-[#ccff00] hover:text-black transition-colors"
                >
                  <FaDownload /> Download Resume
                </a>
                <button
                  type="button"
                  onClick={() => { setIsOpen(false); setTimeout(openCommandPalette, 300); }}
                  className="font-mono text-xs text-gray-500 hover:text-white transition-colors cursor-pointer"
                >
                  Press ⌘K / Ctrl K to jump anywhere
                </button>
                <div className="flex gap-6">
                  <a href="https://github.com/AshishGattu" target="_blank" rel="noopener noreferrer" aria-label="GitHub profile" className="text-2xl text-gray-400 hover:text-white"><FaGithub /></a>
                  <a href="https://linkedin.com/in/ashish-gattu" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile" className="text-2xl text-gray-400 hover:text-white"><FaLinkedin /></a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavBar;
