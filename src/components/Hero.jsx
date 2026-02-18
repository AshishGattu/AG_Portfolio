import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

const Hero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // ANIMATION LOGIC:
  const topTextY = useTransform(scrollYProgress, [0, 1], ["0%", "-100%"]);
  const bottomTextY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.5]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], ["0%", "50%"]); 
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section 
      id="hero"
      ref={ref} 
      className="h-screen w-full relative overflow-hidden flex flex-col justify-center items-center"
    >
      
      {/* --- BACKGROUND TYPOGRAPHY WALL --- */}
      <div className="absolute inset-0 flex flex-col justify-center items-center z-0 opacity-10 select-none pointer-events-none">
        
        {/* TOP GROUP: ARTIFICIAL INTELLIGENCE */}
        {/* FIX: Added 'will-change-transform' to prevent glitching */}
        <motion.div style={{ y: topTextY }} className="flex flex-col items-center mb-12 gap-2 will-change-transform">
            <h1 className="text-6xl md:text-9xl font-bold text-transparent leading-none" style={{ WebkitTextStroke: "2px white" }}>
                ARTIFICIAL
            </h1>
            <h1 className="text-6xl md:text-9xl font-bold text-transparent leading-none" style={{ WebkitTextStroke: "2px white" }}>
                INTELLIGENCE
            </h1>
        </motion.div>

        {/* MIDDLE ANCHOR: "&" */}
        <h1 className="text-[15rem] md:text-[25rem] font-bold text-transparent leading-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-sm" style={{ WebkitTextStroke: "2px rgba(255,255,255,0.5)" }}>
            &
        </h1>

        {/* BOTTOM GROUP: MACHINE LEARNING ENGINEER */}
        {/* FIX: Added 'will-change-transform' */}
        <motion.div style={{ y: bottomTextY }} className="flex flex-col items-center mt-12 gap-2 will-change-transform">
            <h1 className="text-6xl md:text-9xl font-bold text-transparent leading-none" style={{ WebkitTextStroke: "2px white" }}>
                MACHINE
            </h1>
            <h1 className="text-6xl md:text-9xl font-bold text-transparent leading-none" style={{ WebkitTextStroke: "2px white" }}>
                LEARNING
            </h1>
        </motion.div>
      </div>


      {/* --- FOREGROUND CONTENT (Your Name) --- */}
      <motion.div 
        style={{ scale: heroScale, opacity: heroOpacity, y: heroY }}
        // FIX: Added 'will-change-transform'
        className="z-10 text-center px-4 flex flex-col items-center relative will-change-transform"
      >
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          // FIX: Removed 'backdrop-blur-md' to reduce lag (it is expensive). 
          // If you really want it back, change bg-black/80 to bg-black/60 and add backdrop-blur-md, but it costs performance.
          className="text-6xl md:text-9xl font-bold tracking-tighter text-white bg-black/80 px-8 py-2 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
        >
          ASHISH <span className="text-[#ccff00] drop-shadow-[0_0_35px_rgba(204,255,0,0.4)]">GATTU</span>
        </motion.h1>
      </motion.div>

      {/* --- SCROLL DOWN INDICATOR --- */}
      <motion.div 
        style={{ opacity: heroOpacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-5 z-20 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] md:text-xs font-mono tracking-[0.2em] text-[#ccff00]">SCROLL DOWN</span>
        <div className="w-[1px] h-16 bg-white/20 relative overflow-hidden">
            <motion.div 
                animate={{ y: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="w-full h-1/2 bg-[#ccff00] absolute top-0"
            />
        </div>
      </motion.div>

    </section>
  );
};

export default Hero;