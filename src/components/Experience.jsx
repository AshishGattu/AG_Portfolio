import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FaBriefcase, FaCalendarAlt, FaMapMarkerAlt, FaLaptopCode } from "react-icons/fa";

const experiences = [
  {
    id: 1,
    role: "AI Intern",
    company: "Srinishtha Technologies",
    date: "Sept 2025 - Present",
    location: "Hyderabad, India",
    description: "Spearheaded the development of RAG-based chatbots and automation pipelines. Bridged the gap between complex LLM architectures and user-friendly interfaces, optimizing retrieval accuracy by 40%.",
    tech: ["RAG Pipelines", "LLMs", "Python", "Automation"]
  }
];

const Experience = () => {
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  
  // 1. Background Parallax
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  // 2. HEADER FLY-THROUGH LOGIC (Robust Fix)
  const { scrollYProgress: headerProgress } = useScroll({
    target: headerRef,
    // "start end" = When header top hits screen bottom
    // "end start" = When header bottom hits screen top
    offset: ["start end", "end start"] 
  });

  // LOGIC MAP:
  // 0.0 - 0.5 : Entering (Bottom to Center)
  // 0.5       : Locked in Center
  // 0.5 - 1.0 : Exiting (Center to Top)

  // Scale: Huge (2.0) -> Normal (1.0) -> Huge (2.0)
  const headerScale = useTransform(headerProgress, [0.1, 0.5, 0.8], [1.75, 1, 1.75]);
  
  // Opacity: Invisible (0) -> Visible (1) -> Invisible (0)
  const headerOpacity = useTransform(headerProgress, [0.1, 0.4, 0.6, 0.9], [0, 1, 1, 0]);
  
  // Blur: Blurry (10px) -> Sharp (0px) -> Blurry (10px)
  const headerBlur = useTransform(headerProgress, [0.1, 0.5, 0.8], ["10px", "0px", "10px"]);

  // Y: Move up slightly on exit to enhance the "fly through" feel
  const headerY = useTransform(headerProgress, [0.5, 1], [0, -100]);

  return (
    <section 
      ref={containerRef} 
      className="relative min-h-[120vh] pt-10 pb-32 flex flex-col items-center justify-center overflow-hidden"
    >
      
      {/* --- SIDE PILLARS --- */}
      <motion.div style={{ y: bgY, opacity: 0.1 }} className="absolute left-4 md:left-20 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center pointer-events-none select-none z-0 w-32">
        <h1 className="text-[15vh] font-black text-transparent leading-none -rotate-90 whitespace-nowrap tracking-widest" style={{ WebkitTextStroke: "2px white" }}>WORK</h1>
      </motion.div>

      <motion.div style={{ y: bgY, opacity: 0.1 }} className="absolute right-4 md:right-20 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center pointer-events-none select-none z-0 w-32">
        <h1 className="text-[15vh] font-black text-transparent leading-none rotate-90 whitespace-nowrap tracking-widest" style={{ WebkitTextStroke: "2px white" }}>HISTORY</h1>
      </motion.div>

      {/* --- CONTENT --- */}
      <div className="relative z-10 w-full max-w-4xl px-6">
        
        {/* Animated Header */}
        <div ref={headerRef} className="mb-12 text-center z-0">
            <motion.div style={{ scale: headerScale, opacity: headerOpacity, filter: headerBlur, y: headerY }}>
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
                    PROFESSIONAL <span className="text-[#ccff00]">JOURNEY</span>
                </h2>
                <div className="h-1 w-24 bg-[#ccff00] mx-auto rounded-full shadow-[0_0_20px_#ccff00]" />
            </motion.div>
        </div>

        {/* Timeline */}
        <div className="relative z-10 border-l-2 border-white/10 ml-4 md:ml-12 space-y-16">
            {experiences.map((exp, index) => (
                <ExperienceCard key={exp.id} exp={exp} index={index} />
            ))}
        </div>

      </div>
    </section>
  );
};

const ExperienceCard = ({ exp, index }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: index * 0.2 }}
            className="relative pl-8 md:pl-12"
        >
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#ccff00] shadow-[0_0_15px_#ccff00] z-20">
                <div className="absolute inset-0 bg-white opacity-50 rounded-full animate-ping" />
            </div>

            <div className="group relative bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 hover:border-[#ccff00]/50 transition-all duration-500 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#ccff00]/0 via-[#ccff00]/5 to-[#ccff00]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                        <h3 className="text-3xl font-bold text-white group-hover:text-[#ccff00] transition-colors">{exp.role}</h3>
                        <h4 className="text-xl text-gray-400 mt-1 flex items-center gap-2"><FaBriefcase className="text-sm text-[#ccff00]" /> {exp.company}</h4>
                    </div>
                    <div className="mt-4 md:mt-0 text-left md:text-right">
                        <div className="text-[#ccff00] font-mono text-sm flex items-center gap-2 md:justify-end bg-[#ccff00]/10 px-3 py-1 rounded-full w-fit md:w-auto"><FaCalendarAlt /> {exp.date}</div>
                        <div className="text-gray-500 text-sm flex items-center gap-2 md:justify-end mt-2"><FaMapMarkerAlt /> {exp.location}</div>
                    </div>
                </div>

                <p className="text-gray-300 leading-relaxed mb-8 text-lg">{exp.description}</p>

                <div className="flex flex-wrap gap-3">
                    {exp.tech.map((tag, i) => (
                        <span key={i} className="px-4 py-2 rounded-lg bg-black/50 text-white text-xs font-mono border border-white/10 flex items-center gap-2 group-hover:border-[#ccff00]/30 transition-colors">
                            <FaLaptopCode className="text-[#ccff00]" /> {tag}
                        </span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

export default Experience;