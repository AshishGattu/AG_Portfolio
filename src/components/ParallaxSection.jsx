import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const ParallaxSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [0.5, 1.2]);
  const imgY = useTransform(scrollYProgress, [0, 1], ["100px", "-50px"]);
  const contentOpacity = useTransform(scrollYProgress, [0.2, 0.5], [0, 1]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["50px", "0px"]);

  return (
    <section 
      ref={ref} 
      className="relative min-h-screen flex flex-col items-center pt-20 overflow-hidden"
    >
      {/* 1. BACKGROUND LAYER */}
      <motion.div 
        style={{ y: textY }}
        // FIX: Added will-change-transform
        className="absolute inset-0 z-0 flex flex-col justify-end pb-45 items-center opacity-10 pointer-events-none will-change-transform"
      >
        <h1 className="text-[15vw] font-bold text-transparent border-stroke leading-none whitespace-nowrap" style={{ WebkitTextStroke: "2px white" }}>
          DEVELOPER
        </h1>
      </motion.div>

      {/* 2. FOREGROUND LAYER */}
      <div className="relative z-10 w-full max-w-7xl px-6 flex flex-col items-center">
        
        {/* THE IMAGE */}
        <motion.div 
          style={{ scale: imgScale, y: imgY }}
          // FIX: Added will-change-transform
          className="w-full h-[40vh] md:h-[60vh] rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative group will-change-transform"
        >
             {/* FIX: Reduced blur from 100px to 60px and opacity for performance */}
            <div className="absolute inset-0 bg-[#ccff00] blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
            
            <img 
                src="/profile.jpg" 
                alt="Ashish Working" 
                className="w-full h-full object-cover object-[center_30%]"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
        </motion.div>

        {/* THE CONTENT */}
        <motion.div 
            style={{ opacity: contentOpacity, y: contentY }}
            // FIX: Added will-change-transform
            className="mt-12 text-center max-w-2xl will-change-transform"
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