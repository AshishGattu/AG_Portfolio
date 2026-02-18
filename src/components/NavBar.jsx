import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes, FaGithub, FaLinkedin } from "react-icons/fa";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    { title: "Home", href: "#hero" },
    { title: "Projects", href: "#projects" },
    { title: "About", href: "#about" },
    { title: "Contact", href: "mailto:ashishg2204@gmail.com" },
  ];

  return (
    <>
      {/* Floating Menu Button */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={toggleMenu}
          className="p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-[#ccff00] hover:text-black transition-all duration-300"
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
            className="fixed inset-0 bg-black/95 z-40 flex flex-col justify-center items-center"
          >
            <div className="flex flex-col gap-8 text-center">
              {menuItems.map((item, index) => (
                <motion.a
                  key={index}
                  href={item.href}
                  onClick={toggleMenu}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="text-5xl md:text-7xl font-bold text-transparent hover:text-[#ccff00] transition-colors stroke-text cursor-pointer"
                  style={{ WebkitTextStroke: "1px white" }}
                >
                  {item.title}
                </motion.a>
              ))}
            </div>

            {/* Socials */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="absolute bottom-10 flex gap-6"
            >
               <a href="https://github.com/AshishGattu" target="_blank" className="text-2xl text-gray-400 hover:text-white"><FaGithub /></a>
               <a href="https://linkedin.com/in/ashish-gattu" target="_blank" className="text-2xl text-gray-400 hover:text-white"><FaLinkedin /></a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavBar; // <--- THIS LINE WAS MISSING