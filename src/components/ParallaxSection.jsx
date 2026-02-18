import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const ParallaxSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // ANIMATION LOGIC:
  // 1. Background Text: Moves slowly for depth
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  // 2. Image Animation (The "Zoom & Land" Effect)
  // Scale: Starts at 0.9 (smaller) -> Zooms to 1.1
  const imgScale = useTransform(scrollYProgress, [0, 1], [0.5, 1.2]);
  // Y Position: Starts lower (100px) -> Moves up to anchor at top (-50px)
  const imgY = useTransform(scrollYProgress, [0, 1], ["100px", "-50px"]);

  // 3. Content Text Animation (Fades in as image lands)
  const contentOpacity = useTransform(scrollYProgress, [0.2, 0.5], [0, 1]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["50px", "0px"]);

  return (
    <section 
      ref={ref} 
      className="relative min-h-screen flex flex-col items-center pt-20 overflow-hidden"
    >
      {/* 1. BACKGROUND LAYER (Huge Text) */}
      <motion.div 
        style={{ y: textY }}
        className="absolute inset-0 z-0 flex flex-col justify-end pb-45 items-center opacity-10 pointer-events-none"
      >
        <h1 className="text-[15vw] font-bold text-transparent border-stroke leading-none whitespace-nowrap" style={{ WebkitTextStroke: "2px white" }}>
          DEVELOPER
        </h1>
      </motion.div>

      {/* 2. FOREGROUND LAYER (Image & Text) */}
      <div className="relative z-10 w-full max-w-7xl px-6 flex flex-col items-center">
        
        {/* THE IMAGE (Top 1/3rd Landing) */}
        <motion.div 
          style={{ scale: imgScale, y: imgY }}
          className="w-full h-[40vh] md:h-[60vh] rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative group"
        >
             {/* Neon Glow behind image */}
            <div className="absolute inset-0 bg-[#ccff00] blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
            
            <img 
                src="/profile.jpg" 
                alt="Ashish Working" 
                // CHANGE: Used 'object-[center_30%]' to shift focus lower
                className="w-full h-full object-cover object-[center_20%]"
            />
            
            {/* Dark Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
        </motion.div>

        {/* THE CONTENT (Below the image) */}
          <motion.div 
              style={{ opacity: contentOpacity, y: contentY }}
              className="mt-12 text-center max-w-2xl"
          >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  System <span className="text-[#ccff00]">Architect</span>
              </h2>
              <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                  Designing the infrastructure for the next generation of software. 
                  Specializing in <span className="text-white font-semibold">AI Agents</span>, <span className="text-white font-semibold">Computer Vision</span>, and robust backend systems.
              </p>
          </motion.div>

      </div>
    </section>
  );
};

export default ParallaxSection;